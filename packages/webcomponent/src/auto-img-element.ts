/**
 * Definition and functions specific to <auto-img/> element.
 */
import { ImagePosition } from "autoimg-core";
import {
  AutoImgModel,
  getDimensionValue,
  CommonHostAttrs,
  PixelSize,
} from "./base";

function getReversePctNumber(value: string) {
  return `${-Number(value.replace(/[^\d\-\.]/g, ""))}%`;
}

export class AutoImgElement extends HTMLElement {
  model?: AutoImgModel;
  private img: HTMLImageElement;
  declare shadowRoot: ShadowRoot;

  static get observedAttributes() {
    // `src` can be directly defined on <auto-img>, but for
    // general components, it's read from different properties.
    return ["src", "width", "height"].concat(CommonHostAttrs);
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
    this.model?.readAttrs();
    this.model?.loadAndRender();
  }

  disconnectedCallback() {}

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {}

  isImageLoaded(src?: string) {
    return src === this.img.getAttribute("src") && this.img.complete;
  }

  async loadImage(src: string, timeout: any): Promise<PixelSize> {
    // image is already loaded and src does not change
    if (this.isImageLoaded(src)) {
      return new Promise((resolve) => {
        setTimeout(
          () =>
            resolve({
              width: this.img.naturalWidth,
              height: this.img.naturalHeight,
            }),
          timeout
        );
      });
    }

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

