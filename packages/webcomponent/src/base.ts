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
 * Those attributes can be only be read asynchronously from the host element.
 * As an element with width and height set in pixels can still render at a
 * different size.
 */
export const HostAsyncAttrs = ["width", "height"];

/**
 * Those attributes can be read synchronously from the host element.
 */
export const HostSyncAttrs = [
  "focus",
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
  "fetchFocus",
  "fetchUpscale",
];

function getTruthyAttrValue(attrValue: string | null): boolean {
  return attrValue === null || attrValue === "false" ? false : true;
}

function camelToDash(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function getFocus(input: any) {
  let tlx = input["focus.tl.x"],
    tly = input["focus.tl.y"],
    brx = input["focus.br.x"],
    bry = input["focus.br.y"];

  if (typeof input.focus === "string") {
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

  return new Rect(new Point(tlx, tly), new Point(brx, bry));
}

/**
 * A general model applicable for all types of images.
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
    state.setOnResizeStable(this.onSizeSteady);
    this.resizeState = state;
  }

  /**
   * Read attributes and possibly render later (if it's not "deferred").
   *
   * 1. Read sync attrs from elements
   * 2. Start loading image and read async attrs in callbacks.
   *    When placeholder is present, load placeholder then load image.
   * 3. Define on load complete callbacks.
   */
  async loadAndListen() {
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
    } else if (this.imageSrc) {
      const img = new Image();
      img.onload = () => {
        this.onImageLoaded({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.src = this.imageSrc;
    }
  }

  onImageLoaded(imageSize: PixelSize) {
    this.centralizerInput.imageWidth = imageSize.width;
    this.centralizerInput.imageHeight = imageSize.height;
    this.isImageLoaded = true;
    if (!this.defer) {
      this.render();
    }
  }

  onSizeSteady(containerSize: PixelSize) {
    this.isSizeSteady = true;
    this.centralizerInput.viewHeight = containerSize.height;
    this.centralizerInput.viewWidth = containerSize.height;
    if (!this.defer) {
      this.render();
    }
  }

  /**
   * Read sync attributes from host, and assign them to proper fields of the model.
   */
  readSyncAttrs() {
    const attrs: any = {};
    const host = this.host;

    HostSyncAttrs.forEach((attrCamelCaseName) => {
      const attr = camelToDash(attrCamelCaseName);
      const attrName = host.tagName === "AUTO-IMG" ? attr : `data-${attr}`;
      if (host.hasAttribute(attrName)) {
        const attrValue = host.getAttribute(attrName);
        attrs[attrCamelCaseName] = attrValue;
      }
    });

    this.centralizerInput.focus = getFocus(attrs);
    this.centralizerInput.allowDistortion = getTruthyAttrValue(
      attrs.allowDistortion
    );
    this.centralizerInput.config = {
      padding: attrs.padding,
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
      const focusRect = input.focus;
      const image = new AutoImage(imageRect, focusRect);
      const allowDistortion = input.allowDistortion || false;
      const centralizer: TouchAndRecenterCentralizer =
        new TouchAndRecenterCentralizer(image, containerRect);
      await centralizer.transform(allowDistortion, input.config);
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
}
