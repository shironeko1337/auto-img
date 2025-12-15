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
const AutoImgElementAttrs = ["src", "width", "height", "placeholder"];

// Global API reference set by auto-img-element.define.ts
let _autoImgAPI: AutoImgAPI | null = null;

export function setAutoImgAPI(api: AutoImgAPI) {
  _autoImgAPI = api;
}

export class AutoImgElement extends HTMLElement {
  model?: AutoImgModel;
  private img: HTMLImageElement;
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

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    // Update styles when width or height attributes change
    if (name === "width" && newValue !== oldValue) {
      this.style.width = getDimensionValue(newValue) || "100%";
    } else if (name === "height" && newValue !== oldValue) {
      this.style.height = getDimensionValue(newValue) || "100%";
    }

    // If model exists, read attrs and potentially re-render
    if (this.model && CommonHostAttrs.includes(name)) {
      if (this.model.readAttrs()) {
        this.model.loadAndRender();
      }
    }
  }

  disconnectedCallback() {}

  isImageLoaded(src?: string) {
    return src === this.img.getAttribute("src") && this.img.complete;
  }

  /**
   * Load image by src.
   */
  async loadImage(src: string, timeout: any): Promise<PixelSize> {
    if (this.isImageLoaded(src)) {// image with that src is already loaded.
      return Promise.resolve({
        width: this.img.naturalWidth,
        height: this.img.naturalHeight,
      });
    } else {
      this.img.src = src;
      return await Promise.race<PixelSize>([
        new Promise((resolve) => {
          this.img.addEventListener("load", () => {
            resolve({
              width: this.img.naturalWidth,
              height: this.img.naturalHeight,
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
}
