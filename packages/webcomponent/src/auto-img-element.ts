/**
 * Definition and functions specific to <auto-img/> element.
 */
import { ImagePosition } from "autoimg-core";
import {
  AutoImgModel,
  getDimensionValue,
  CommonHostAttrs,
  PixelSize,
  getReversePctNumber,
} from "./base";
import type { AutoImgAPI } from "./auto-img-api";

/**
 * Attributes exclusive to auto-img elements.
 */
const AutoImgElementAttrs = ["src", "width", "height"];

// Global API reference set by auto-img-element.define.ts
let _autoImgAPI: AutoImgAPI | null = null;

export function setAutoImgAPI(api: AutoImgAPI) {
  _autoImgAPI = api;
}

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

    this.style.width = getDimensionValue(this.getAttribute("width")) || "100%";
    this.style.height =
      getDimensionValue(this.getAttribute("height")) || "100%";
    this.style.position = "relative";
    this.style.overflow = "hidden";
    this.style.display = "block";
    this.img = document.createElement("img");
    this.img.style.position = "absolute";
    this.img.style.display = "block";
    this.shadowRoot.appendChild(this.img);
  }

  connectedCallback() {
    // Auto-attach model if not already attached
    // This is needed for elements created dynamically after initial page load
    if (!this.model && _autoImgAPI) {
      _autoImgAPI.load(this);
    } else if (this.model?.readAttrs()) {
      this.model.loadAndRender();
    }
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    // Update styles when width or height attributes change
    if (name === "width" && newValue !== oldValue) {
      this.style.width = getDimensionValue(newValue) || "100%";
    } else if (name === "height" && newValue !== oldValue) {
      this.style.height = getDimensionValue(newValue) || "100%";
    }

    // If model exists, read attrs and potentially re-render
    if (this.model && AutoImgElementAttrs.includes(name)) {
      if (this.model.readAttrs()) {
        this.model.loadAndRender();
      }
    }
  }

  disconnectedCallback() {}

  /**
   * If image is loaded, if there are image loading, it's the loading state of that
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
   * Load image by src.
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

      this.loadingImg.src = src;
      return await Promise.race<PixelSize>([
        new Promise((resolve) => {
          this.loadingImg!.addEventListener("load", () => {
            resolve({
              width: this.loadingImg!.naturalWidth,
              height: this.loadingImg!.naturalHeight,
            });
          });
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

  setPositionForPlaceholder() {
    this.img.style.width = "100%";
    this.img.style.height = "100%";
    this.img.style.objectFit = "none";
  }
}
