/**
 * 1. Basic types and component model.
 * 2. Utility functions.
 */
import {
  Point,
  Rect,
  Image as AutoImage,
  ImagePosition,
  PixelSize,
  MutableState,
} from "./base";

import {
  AutoImgInput,
  inputValidation,
  TouchAndRecenterCentralizer,
} from "./centralizer";
import { AutoImgAPI, AutoImgConfig } from "./api";

import { camelToDash, getTruthyAttrValue } from "./util";

import { CommonHostAttrs } from "./constants";


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
    const elementType = model.isAutoImg() ? "auto-img" : "native element";
    const requiredAttr = model.isAutoImg()
      ? '"src" attribute'
      : '"data-auto-img-src" attribute or background-image style';

    console.warn(
      `[AutoImg] Missing image source for ${elementType}. Provide ${requiredAttr}.`,
      model.host
    );
    model.host.dispatchEvent(
      new CustomEvent("autoimg-error", {
        detail: {
          type: "missing-src",
          message: `Missing image source. Provide ${requiredAttr}.`,
        },
        bubbles: true,
        composed: true,
      })
    );
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
  // Loaded images for a native element, everytime the image src changes, there
  // would be a new value set. Assume browser caches result, if the src is found
  // in this set, the image is considered to be already loaded.
  loadedImages: Map<string, PixelSize>;

  constructor(element: HTMLElement, api: AutoImgAPI) {
    this.centralizerInput = {};
    this.host = element;
    this.config = api.config;
    const state = new MutableState<PixelSize>(this.config.resizeThrottle);
    state.setOnResize(() => (this.isSizeSteady = false));
    state.setOnResizeStable(this.onSizeSteady.bind(this));
    this.resizeState = state;
    this.loadedImages = new Map();

    if (this.isAutoImg()) {
      (this.host as any).model = this;
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

    // If there isn't a valid image src, skip loading.
    if (!this.imageSrc) return;

    // If the image is already loaded, then try rendering
    if (this.isImageLoaded) {
      const dimensions = this.loadedImages.get(this.imageSrc);
      if (dimensions) {
        this.onImageLoaded(dimensions);
        return;
      } else {
        // Why loaded flag is flipped, but we don't get dimension data?
      }
    }

    if (tag === "AUTO-IMG") {
      const el = this.host as any;

      if (this.placeholder) {
        // If placeholder is present, load placeholder, show it immediately,
        // then load image and try rendering.
        await el.loadImage(this.placeholder, this.config.loadImageTimeout);
        el.showLoadedImage();
        el.setPositionForPlaceholder();
        const imageSize: PixelSize = await el.loadImage(
          this.imageSrc,
          this.config.loadImageTimeout
        );
        this.onImageLoaded(imageSize);
      } else {
        // Load image and try rendering.
        const imageSize: PixelSize = await el.loadImage(
          this.imageSrc,
          this.config.loadImageTimeout
        );
        this.onImageLoaded(imageSize);
      }
    } else if (tag === "IMG") {
      // If image is loaded, then try rendering.
      const el = this.host as HTMLImageElement;
      if (el.complete) {
        this.onImageLoaded({
          width: el.naturalWidth,
          height: el.naturalHeight,
        });
      } else {
        // If image is still loading or hasn't been loaded, restart loading
        // and try rendering later.
        this.host.addEventListener("load", () => {
          this.onImageLoaded({
            width: el.naturalWidth,
            height: el.naturalHeight,
          });
        });

        el.src = this.imageSrc!;
      }
    } else {
      // There are native ways to know if background-image of a native element
      // is loaded or not, so we only rely on `this.isImageLoaded`. And
      // always reload if the image is not loaded.
      const img = new Image();

      // Override the background image property.
      this.host.style.backgroundImage = `url("${this.imageSrc}")`;

      // Try rendering when image loaded, or stop when timeout.
      Promise.race<PixelSize>([
        new Promise((resolve) => {
          img.addEventListener("load", () => {
            resolve({
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
          });
        }),
        new Promise((resolve) => {
          setTimeout(
            () => resolve({ width: 0, height: 0 }),
            this.config.loadImageTimeout
          );
        }),
      ]).then(this.onImageLoaded.bind(this));

      img.src = this.imageSrc;
    }
  }

  /**
   * On image loaded, try rendering, here rendering actually mean positioning.
   */
  onImageLoaded(imageSize: PixelSize) {
    if (imageSize.width > 0 && imageSize.height > 0) {
      this.centralizerInput.imageWidth = imageSize.width;
      this.centralizerInput.imageHeight = imageSize.height;
      this.isImageLoaded = true;
      this.loadedImages.set(this.imageSrc!, imageSize);
      if (!this.defer && !this.config.defer) {
        this.render();
      }
    }
  }

  onSizeSteady(containerSize: PixelSize) {
    if (containerSize.width > 0 && containerSize.height > 0) {
      this.isSizeSteady = true;
      this.centralizerInput.viewHeight = containerSize.height;
      this.centralizerInput.viewWidth = containerSize.width;
      if (!this.defer && !this.config.defer) {
        this.render();
      }
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
      const autoImgEl = this.host as any;
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
        .filter(([_, condition]) => condition)
        .map(([scale, _]) => scale)
        .sort((a, b) => (a < b ? 1 : -1));
      if (sortedScales.length) {
        const scale = sortedScales[0];

        return new Rect(
          new Point(x - scale * ratio, y - scale),
          new Point(x + scale * ratio, y + scale)
        );
      } else {
        return new Rect(new Point(0, 0), new Point(imageWidth, imageHeight));
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
