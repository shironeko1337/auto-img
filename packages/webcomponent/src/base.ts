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
  static DEFAULT_TIME_BEFORE_STABLE = 300
  initialized = false;
  isStable = true;
  private onStable?: Function;
  private onResize?: Function;
  private value?: T;
  private lastChangeTs: any = -1;
  constructor(private timeUntilStable = MutableState.DEFAULT_TIME_BEFORE_STABLE) {}

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
 * Host attributes that are comon to native elements and auto-img elements.
 */
export const CommonHostAttrs = [
  "focus",
  "focusCenter",
  "focus.tl",
  "focus.tl.x",
  "focus.tl.y",
  "focus.br",
  "focus.br.x",
  "focus.br.y",

  "defer",
  "allowDistortion",
  "padding",
  // placeholder should belong to model, however, since rendering can't be controlled
  // for native element, it's only effective for auto-img elements.
  "placeholder",
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
  const trimmed = attrValue.trim();

  // Check if it's just a number without units
  const numVal = parseFloat(trimmed);
  if (!Number.isNaN(numVal) && trimmed === numVal.toString()) {
    return numVal + "px";
  }

  // Otherwise, check if it's a valid dimension with units
  if (isDimensionValue(trimmed)) {
    return trimmed;
  }

  return "";
}

/**
 * HTML attruibutes defined might have "false" as value and it should be equivalent to undefined or null,
 * otherwise. it's true, including empty string,.
 */
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

/**
 * -5.1% to 5.1%
 */
export function getReversePctNumber(value: string) {
  return `${-Number(value.replace(/[^\d\-\.]/g, ""))}%`;
}

function getFocusCenter(input: any) {
  let x = input["focusCenter.x"],
    y = input["focusCenter.y"];

  if (typeof input["focusCenter"] === "string") {
    [x, y] = input.focusCenter.split(",");
  }

  return new Point(parseFloat(x), parseFloat(y));
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

  // If no focus attributes were provided, return undefined
  if (
    tlx === undefined &&
    tly === undefined &&
    brx === undefined &&
    bry === undefined
  ) {
    return undefined;
  }

  [tlx, tly, brx, bry] = [tlx, tly, brx, bry].map(parseFloat);
  return new Rect(new Point(tlx, tly), new Point(brx, bry));
}

/**
 * If model has valid attributes after readAttr. It's different from inputValidation
 * as it's not for the centralizer algorithm.
 */
function attrValidation(model: AutoImgModel) {
  // Check if imageSrc is present
  if (!model.imageSrc || model.imageSrc.trim() === "") {
    const elementType = model.isAutoImg() ? 'auto-img' : 'native element';
    const requiredAttr = model.isAutoImg()
      ? '"src" attribute'
      : '"data-auto-img-src" attribute or background-image style';

    console.warn(`[AutoImg] Missing image source for ${elementType}. Provide ${requiredAttr}.`, model.host);
    model.host.dispatchEvent(new CustomEvent('autoimg-error', {
      detail: {
        type: 'missing-src',
        message: `Missing image source. Provide ${requiredAttr}.`
      },
      bubbles: true,
      composed: true
    }));
    return false;
  }
  return true;
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
  // Whether we defer rendering the image, only makes sense before the first render,
  // once we render it manually, it's set to true.
  // Notice for auto-img we defer rendering, for native elements, the actual
  // rendering isn't controlled by AutoImg model, so we only defer centralizing.
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

    if (this.isAutoImg()) {
      (this.host as AutoImgElement).model = this;
    }
  }

  /**
   * Read attributes from host, and assign them to proper fields of the model.
   * Return if attrs are valid.
   */
  readAttrs() {
    const attrs: any = {};
    const host = this.host;

    CommonHostAttrs.forEach((attrCamelCaseName) => {
      const attr = camelToDash(attrCamelCaseName);
      const attrName = this.isAutoImg() ? attr : `data-auto-img-${attr}`;
      if (host.hasAttribute(attrName)) {
        const attrValue = host.getAttribute(attrName);
        attrs[attrCamelCaseName] = attrValue;
      }
    });

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
    if (this.isAutoImg()) {
      src = host.getAttribute("src") || "";
    } else {
      // For native elements, first try data-auto-img-src attribute
      src = host.getAttribute("data-auto-img-src") || "";

      // If not specified, try to get the background-image property
      if (!src) {
        const style = getComputedStyle(host);
        const bg = style.backgroundImage;
        const match = /url\(["']?(.*?)["']?\)/.exec(bg);
        if (match) {
          src = match[1];
        }
      }
    }
    this.imageSrc = src;
    this.placeholder = attrs.placeholder || this.config.placeholder;
    this.defer = getTruthyAttrValue(attrs.defer);
    return attrValidation(this);
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

      // Check if element's internal img is already loaded
      const internalImg = (el as any).img as HTMLImageElement;
      if (internalImg && internalImg.complete && internalImg.naturalWidth > 0) {
        // Image is already loaded in the element, just update model state if needed
        if (!this.isImageLoaded) {
          this.onImageLoaded({
            width: internalImg.naturalWidth,
            height: internalImg.naturalHeight,
          });
        }
        return;
      }

      // If model already has valid image dimensions, skip loading
      if (
        this.isImageLoaded &&
        this.centralizerInput.imageWidth &&
        this.centralizerInput.imageHeight
      ) {
        return;
      }

      if (this.placeholder && !el.isImageLoaded(this.imageSrc)) {
        await el.loadImage(this.placeholder, this.config.loadImageTimeout);
        el.showLoadedImage();
        el.setPositionForPlaceholder();
        if (this.imageSrc) {
          const imageSize: PixelSize = await el.loadImage(
            this.imageSrc,
            this.config.loadImageTimeout
          );
          if (imageSize.width > 0 && imageSize.height > 0) {
            this.onImageLoaded(imageSize);
          }
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
      this.showCentralizedImage(centralizer.getPosition());
    } else {
      // TODO error handling
    }
  }

  /**
   * For auto-img, set positions and show the loaded image.
   * For native element, set positions.
   */
  showCentralizedImage(position: ImagePosition) {
    if (this.isAutoImg()) {
      const autoImgEl = this.host as AutoImgElement;
      autoImgEl.showLoadedImage();
      autoImgEl.setPosition(position);
    } else {
      this.host.style.backgroundSize = position.backgroundSize;
      this.host.style.backgroundPosition = position.backgroundPosition;
    }
  }

  isAutoImg() {
    return this.host.tagName === "AUTO-IMG";
  }

  /**
   * Get focus area by focus rectangle or using an algorithm to calculate focus
   * rectangle when only focus center is defined.
   */
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
        [(imageWidth - x) / ratio, (imageWidth - x) / ratio <= yDistance],
        [imageHeight - y, (imageHeight - y) * ratio <= xDistance],
        [x / ratio, x / ratio <= yDistance],
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
