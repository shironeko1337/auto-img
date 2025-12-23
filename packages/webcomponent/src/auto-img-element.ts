/**
 * Definition and functions specific to <auto-img/> element.
 */
import {
  ImagePosition,
  AutoImgModel,
  PixelSize,
  _getReversePctNumber as getReversePctNumber,
  _getDimensionValue as getDimensionValue,
  _CommonHostAttrs as CommonHostAttrs,
} from "@shironeko1052/autoimg-core";

import { autoImgAPI } from "@shironeko1052/autoimg-core/api";

const IMG_ATTR_PREFIX = "img-";
/**
 * Attributes exclusive to auto-img elements.
 */
const ATTRS_FOR_RENDER = ["src", "width", "height"];
const IMG_ATTRIBUTE_DEFAULTS = {
  alt: "",
  loading: undefined,
  title: "",
  draggable: false,
  crossOrigin: "",
  decoding: "async",
  fetchPriority: false,
};

const AutoImgElementAttrs = ATTRS_FOR_RENDER.concat(
  Object.keys(IMG_ATTRIBUTE_DEFAULTS).map((attr) => `${IMG_ATTR_PREFIX}${attr}`)
);

type PenetratableImgAttrs = keyof typeof IMG_ATTRIBUTE_DEFAULTS;

export class AutoImgElement extends HTMLElement {
  model?: AutoImgModel;
  // The image for presenting.
  private img: HTMLImageElement;
  // The image that is loading or not ready to be presented.
  private loadingImg?: HTMLImageElement;
  declare shadowRoot: ShadowRoot;

  static get observedAttributes() {
    return AutoImgElementAttrs.concat(CommonHostAttrs);
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.img = document.createElement("img");
    this.img.style.position = "absolute";
    this.img.style.display = "block";
    this.img.style.userSelect = "none";
    this.img.setAttribute("part", "image");

    this.shadowRoot.appendChild(this.img);
  }

  connectedCallback() {
    this.style.position = "relative";
    this.style.overflow = "hidden";
    this.style.display = "block";

    // Apply initial dimensions and attributes after element is connected
    this._applyDimension({
      width: this.getAttribute("width"),
      height: this.getAttribute("height"),
    });
    this._applyAttributes();

    if (!this.model && autoImgAPI) {
      autoImgAPI.load(this);
    }
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (
      oldValue !== newValue &&
      (ATTRS_FOR_RENDER.includes(name) || CommonHostAttrs.includes(name))
    ) {
      if (["width", "height"].includes(name)) {
        this._applyDimension({ name: newValue || "100%" });
      }

      if (this.model) {
        // src and all other model attributes would be handled here
        if (this.model.readAttrs()) {
          console.log('load and render', this.getAttribute('focus'));
          this.model.loadAndRender();
        }
      }
    }
  }

  disconnectedCallback() {}

  /**
   * Returns if image is loaded.
   *
   * @param src Image src.
   *
   * If there are image loading, it's the loading state of that
   * image, otherwise it's loaded as long as img src equals to given src.
   */
  isImageLoaded(src?: string) {
    return this.loadingImg
      ? this.loadingImg &&
          src === this.loadingImg.getAttribute("src") &&
          this.loadingImg.complete
      : this.img && this.img.src === src;
  }

  /**
   * Show loaded image and set loading image to empty.
   */
  showLoadedImage() {
    if (this.loadingImg) {
      this.shadowRoot.removeChild(this.img);
      this.img = this.loadingImg;
      this.img.style.display = "block";
      this.loadingImg = undefined;
    }
  }

  /**
   * Start loading image by src.
   *
   * @param src Image src string.
   * @param timeout Load timeout.
   */
  async loadImage(src: string, timeout: any): Promise<PixelSize> {
    if (this.isImageLoaded(src)) {
      const loadedImg = this.loadingImg || this.img;
      return Promise.resolve({
        width: loadedImg.naturalWidth,
        height: loadedImg.naturalHeight,
      });
    } else {
      // Create a hidden image for loading, and present once loaded.
      this.loadingImg = document.createElement("img");
      this.loadingImg.style.position = "absolute";
      this.loadingImg.style.display = "none";
      this.shadowRoot.appendChild(this.loadingImg);

      return await Promise.race<PixelSize>([
        new Promise((resolve, reject) => {
          this.loadingImg!.onload = () => {
            resolve({
              width: this.loadingImg!.naturalWidth,
              height: this.loadingImg!.naturalHeight,
            });
          };

          this.loadingImg!.onerror = (error) => {
            reject(new Error(`Failed to load image: ${src}`));
          };

          this.loadingImg!.src = src;

          // Check if image loaded synchronously from cache
          if (this.loadingImg!.complete) {
            if (this.loadingImg!.naturalWidth > 0) {
              resolve({
                width: this.loadingImg!.naturalWidth,
                height: this.loadingImg!.naturalHeight,
              });
            } else {
              reject(new Error(`Failed to load image: ${src}`));
            }
          }
        }),
        new Promise((resolve) => {
          setTimeout(() => resolve({ width: 0, height: 0 }), timeout);
        }),
      ]);
    }
  }

  /**
   * Set position for img element, equivalent to setting the background-position
   * and background-size for a native element.
   *
   * @param position CSS position for setting a background image, see
   * https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/background-position
   * and
   * https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/background-size.
   */
  setPosition(position: ImagePosition) {
    const [width, height] = position.backgroundSize.split(" ");
    const [left, top] = position.backgroundPosition.split(" ");
    this.img.style.width = width;
    this.img.style.height = height;
    this.img.style.left = left;
    this.img.style.top = top;
    this.img.style.transform = `translate(
    ${getReversePctNumber(left)},
    ${getReversePctNumber(top)})`;
  }

  /**
   * Set position for placeholder, keep it in the center of image container
   * without stretching.
   */
  setPositionForPlaceholder() {
    this.img.style.width = "100%";
    this.img.style.height = "100%";
    this.img.style.objectFit = "none";
  }

  private _applyAttribute(key: PenetratableImgAttrs, value: any) {
    value ||= IMG_ATTRIBUTE_DEFAULTS[key];
    if (value === undefined || value === null) {
      if (this.img.hasAttribute(key)) {
        this.img.removeAttribute(key);
      }
    } else {
      this.img.setAttribute(key, value);
    }
  }

  private _applyAttributes() {
    for (const key in IMG_ATTRIBUTE_DEFAULTS) {
      this._applyAttribute(
        key as PenetratableImgAttrs,
        this.getAttribute(`${IMG_ATTR_PREFIX}${key}`)
      );
    }
  }

  private _applyDimension({ width, height }: any) {
    this.style.width = width ? getDimensionValue(width) : "100%";
    this.style.height = height ? getDimensionValue(height) : "100%";
  }
}
