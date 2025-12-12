/**
 * 1. Basic types and component model.
 * 2. Utility functions.
 */
import {
  AutoImgInput,
  Point,
  Rect,
  inputValidation,
  Image as AutoImage,
  TouchAndRecenterCentralizer,
  ImagePosition,
} from "autoimg-core";
import { AutoImgElement } from "./auto-img-element";
import { AutoImgAPI, AutoImgConfig } from "./auto-img-api";

export type PixelSize = { width: number; height: number };

/**
 * A state with throttle mechanism and a stable handler setter to emit
 * when it's stable.
 */
export class MutableState<T> {
  initialized = false;
  isStable = true;
  private onStable?: Function;
  private onResize?: Function;
  private value?: T;
  private lastChangeTs: any = -1;
  constructor(private timeUntilStable = 300) {}

  set(value: T) {
    this.initialized = true;
    this.value = value;
    if (this.onResize) this.onResize(this.stableValue);
    if (this.lastChangeTs != -1) {
      clearTimeout(this.lastChangeTs);
    }
    this.lastChangeTs = setTimeout(() => {
      this.setStable();
      if (this.onStable) this.onStable(this.stableValue);
    }, this.timeUntilStable);
  }

  setOnResizeStable(onStable?: Function) {
    this.onStable = onStable;
  }
  setOnResize(onResize?: Function) {
    this.onResize = onResize;
  }
  private setStable() {
    this.isStable = true;
  }

  get stableValue() {
    return this.initialized && this.isStable ? this.value : null;
  }
}

/**
 * Those attributes can be read synchronously from the host element.
 */
export const HostAttrs = [
  "width",
  "height",
  "focus",
  "focusCenter",
  "focus.tl",
  "focus.tl.x",
  "focus.tl.y",
  "focus.br",
  "focus.br.x",
  "focus.br.y",
  "placeholder",

  "defer",
  "allowDistortion",
  "padding",
];

function isDimensionValue(value: string) {
  if (typeof value !== "string") return false;

  // List of CSS length units
  const units = [
    "px",
    "em",
    "rem",
    "vw",
    "vh",
    "vmin",
    "vmax",
    "cm",
    "mm",
    "in",
    "pt",
    "pc",
    "q",
    "%",
  ];

  // Build a regex: optional sign, number (int or decimal), optional unit
  const unitPattern = units.join("|");
  const regex = new RegExp(`^[-+]?\\d*\\.?\\d+(?:${unitPattern})?$`, "i");

  return regex.test(value.trim());
}

/**
 * Return a dimension string in px if it's a numeric value, otherwise return the original value.
 */
export function getDimensionValue(attrValue: string | number | null): string {
  attrValue = `${attrValue}`;
  const numVal = parseFloat(attrValue);
  if (!Number.isNaN(numVal)) {
    return numVal + "px";
  }
  return isDimensionValue(attrValue) ? attrValue : "";
}

function getTruthyAttrValue(attrValue: string | null | undefined): boolean {
  return attrValue === undefined || attrValue === null || attrValue === "false"
    ? false
    : true;
}

function camelToDash(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function getFocusCenter(input: any) {
  let x = input["focusCenter.x"],
    y = input["focusCenter.y"];

  if (typeof input["focusCenter"] === "string") {
    [x, y] = input.focus.split(",");
  }

  return new Point(x, y);
}

function getFocus(input: any) {
  let tlx = input["focus.tl.x"],
    tly = input["focus.tl.y"],
    brx = input["focus.br.x"],
    bry = input["focus.br.y"];

  if (typeof input["focus"] === "string") {
    const [tl, br] = input.focus.split(";");
    [tlx, tly] = tl.split(",");
    [brx, bry] = br.split(",");
  } else if (
    typeof input["focus.tl"] == "string" &&
    typeof input["focus.br"] === "string"
  ) {
    [tlx, tly] = input["focus.tl"].split(",");
    [brx, bry] = input["focus.br"].split(",");
  }
  [tlx, tly, brx, bry] = [tlx, tly, brx, bry].map(parseFloat);
  return new Rect(new Point(tlx, tly), new Point(brx, bry));
}

/**
 * Component model attached to <autoimg/> element and other types of element
 * with core functionalities.
 */
export class AutoImgModel {
  config: AutoImgConfig;
  centralizerInput: Partial<AutoImgInput>;
  host: HTMLElement;
  // A placeholder image should be a base64 string or an image that can be quickly
  // loaded. The render process starts synchronously after placeholder is loaded.
  placeholder?: string;
  imageSrc?: string;
  isImageLoaded = false;
  // A resize observer is subscribed to watch the resizing of element,
  // after the initial render, the element would be marked as size steady
  // if the size doesn't change within a certain period of time.
  isSizeSteady = false;
  // Whether we defer render the image, only makes sense before the first render,
  // once we render it manually, it's set to true.
  defer = false;
  resizeState?: MutableState<PixelSize>;

  constructor(element: HTMLElement, api: AutoImgAPI) {
    this.centralizerInput = {};
    this.host = element;
    this.config = api.config;
    const state = new MutableState<PixelSize>(this.config.resizeThrottle);
    state.setOnResize(() => (this.isSizeSteady = false));
    state.setOnResizeStable(this.onSizeSteady.bind(this));
    this.resizeState = state;

    if (this.host.tagName === "AUTO-IMG") {
      (this.host as AutoImgElement).model = this;
    }
  }

  /**
   * Read attributes and possibly render later (if it's not "deferred").
   *
   * 1. Read attrs from elements.
   * 2. Start loading image.
   *    When placeholder is present, load placeholder then load image.
   * 3. Define on load complete callbacks.
   */
  async loadAndRender() {
    const tag = this.host.tagName;
    if (tag === "AUTO-IMG") {
      const el = this.host as AutoImgElement;
      if (this.placeholder && !el.isImageLoaded(this.imageSrc)) {
        await el.loadImage(
          this.placeholder,
          this.config.loadPlaceholderTimeout
        );
        if (this.imageSrc) {
          const imageSize: PixelSize = await el.loadImage(
            this.imageSrc,
            this.config.loadImageTimeout
          );
          this.onImageLoaded(imageSize);
        }
      } else {
        if (this.imageSrc) {
          const imageSize: PixelSize = await el.loadImage(
            this.imageSrc,
            this.config.loadImageTimeout
          );
          this.onImageLoaded(imageSize);
        }
      }
    } else if (tag === "IMG") {
      const el = this.host as HTMLImageElement;
      this.host.addEventListener("load", () => {
        this.onImageLoaded({
          width: el.naturalWidth,
          height: el.naturalHeight,
        });
      });
    } else {
      let imageSrc = this.imageSrc || this._getBackgroundImage(this.host);
      if (imageSrc) {
        this.host.style.backgroundImage = `url(${this.imageSrc})`;
      } else {
        // TODO missing both data-auto-img-src and background-image for the element
      }
    }
  }

  onImageLoaded(imageSize: PixelSize) {
    this.centralizerInput.imageWidth = imageSize.width;
    this.centralizerInput.imageHeight = imageSize.height;
    this.isImageLoaded = true;
    if (!this.defer && !this.config.defer) {
      this.render();
    }
  }

  onSizeSteady(containerSize: PixelSize) {
    this.isSizeSteady = true;
    this.centralizerInput.viewHeight = containerSize.height;
    this.centralizerInput.viewWidth = containerSize.width;
    if (!this.defer && !this.config.defer) {
      this.render();
    }
  }

  /**
   * Read attributes from host, and assign them to proper fields of the model.
   */
  readAttrs() {
    const attrs: any = {};
    const host = this.host;
    const isHTMLElement = host.tagName !== "AUTO-IMG";

    HostAttrs.forEach((attrCamelCaseName) => {
      const attr = camelToDash(attrCamelCaseName);
      const attrName = isHTMLElement ? `data-auto-img-${attr}` : attr;
      if (host.hasAttribute(attrName)) {
        const attrValue = host.getAttribute(attrName);
        attrs[attrCamelCaseName] = attrValue;
      }
    });

    // we rely on the stable size unless width and height are exactly set to
    // a pixel value ('100px' and '100' both counts).
    const numericWidth = parseFloat(attrs.width?.replace("px", ""));
    const numericHeight = parseFloat(attrs.height?.replace("px", ""));

    if (!Number.isNaN(numericWidth)) {
      this.centralizerInput.viewWidth = numericWidth;
    }
    if (!Number.isNaN(numericHeight)) {
      this.centralizerInput.viewHeight = numericHeight;
    }

    this.isSizeSteady =
      !!this.centralizerInput.viewHeight && !!this.centralizerInput.viewWidth;
    this.centralizerInput.focus = getFocus(attrs);
    this.centralizerInput.focusCenter = getFocusCenter(attrs);
    this.centralizerInput.allowDistortion = getTruthyAttrValue(
      attrs.allowDistortion
    );
    this.centralizerInput.config = {
      padding: parseFloat(attrs.padding),
    };

    let src = "";
    const tag = host.tagName;
    if (tag === "AUTO-IMG") {
      src = host.getAttribute("src") || "";
    } else {
      /**
       * Try to get the background-image property,
       * mention here not all elements with a valid background-image can be
       * adjusted by background-position and background-size.
       */
      const style = getComputedStyle(host);
      const bg = style.backgroundImage;
      const match = /url\(["']?(.*?)["']?\)/.exec(bg);
      if (match) {
        src = match[1];
      }
    }
    this.imageSrc = src;
    this.placeholder = attrs.placeholder || this.config.placeholder;
    this.defer = getTruthyAttrValue(attrs.defer);
  }

  /**
   * Render the image when image is loaded and size is steady.
   */
  async render() {
    if (!this.isImageLoaded || !this.isSizeSteady) {
      return;
    }

    const errors = inputValidation(this.centralizerInput);
    if (!errors.length) {
      const input = this.centralizerInput;
      const containerRect = Rect.fromDimension(
        input.viewWidth!,
        input.viewHeight!
      );
      const imageRect = Rect.fromDimension(
        input.imageWidth!,
        input.imageHeight!
      );

      // get focus area by focus center given the container rect
      // we scale the focus area by the container ratio as much as possible
      // with the focus rectangle staying in the image.
      const image = new AutoImage(imageRect, this._getFocusArea(input));
      const allowDistortion = input.allowDistortion || false;
      const centralizer: TouchAndRecenterCentralizer =
        new TouchAndRecenterCentralizer(image, containerRect);
      await centralizer.transform(allowDistortion, { ...input.config });
      this.setPosition(centralizer.getPosition());
    } else {
      // TODO error handling
    }
  }

  setPosition(position: ImagePosition) {
    const tag = this.host.tagName;
    if (tag === "AUTO-IMG") {
      (this.host as AutoImgElement).setPosition(position);
    } else {
      this.host.style.backgroundSize = position.backgroundSize;
      this.host.style.backgroundPosition = position.backgroundPosition;
    }
  }

  _getFocusArea(input: Partial<AutoImgInput>) {
    if (input.focusCenter && !input.focus) {
      const ratio = input.viewWidth! / input.viewHeight!;
      const imageWidth = input.imageWidth!,
        imageHeight = input.imageHeight!,
        x = input.focusCenter.x,
        y = input.focusCenter.y;
      const xDistance = Math.min(x, imageWidth - x),
        yDistance = Math.min(y, imageHeight - y);

      /* Expand scale of four edges, conditions of focus staying in the image */
      const sortedScales: any = [
        [y, y * ratio <= xDistance],
        [(imageWidth - x) / ratio, imageWidth - x <= yDistance],
        [imageHeight - y, (imageHeight - y) * ratio <= xDistance],
        [x, x / ratio <= yDistance],
      ]
        .filter(([scale, condition]) => condition)
        .map(([scale, condition]) => scale)
        .sort((a, b) => (a < b ? 1 : -1));

      if (sortedScales.length) {
        const scale = sortedScales[0];

        return new Rect(
          new Point(x - scale * ratio, y - scale),
          new Point(x + scale * ratio, y + scale)
        );
      }
    } else {
      return input.focus?.copy();
    }
  }

  /**
   * Returns the background image url address from the background image
   * property.
   */
  _getBackgroundImage(e: HTMLElement): string | null {
    const bg = getComputedStyle(e).backgroundImage;
    const urls = [...bg.matchAll(/url\((['"]?)(.*?)\1\)/g)].map((m) => m[2]);
    return urls.length === 1 ? urls[0] : null;
  }
}
