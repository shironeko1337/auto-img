import { AutoImgElement } from "./auto-img-element";
import { AutoImgAPI, autoImgAPI } from "@shironeko1052/autoimg-core/api";

// Auto-register the custom element
if (!customElements.get("auto-img")) {
  customElements.define("auto-img", AutoImgElement);
}

// Expose custom element to global namespace on browser
if (typeof window !== "undefined") {
  (window as any).AutoImgElement = AutoImgElement;
  (window as any).AutoImgAPI = autoImgAPI;
}

// Attributes for auto-img element
// html is not case sensitive so we use hypen here
interface AutoImgAttributes {
  src?: string;
  width?: string;
  height?: string;
  placeholder?: string;
  defer?: boolean | "";
  "allow-distortion"?: boolean | "";
  padding?: string | number;
  focus?: string;
  "focus-center"?: string;
  "focus.tl"?: string;
  "focus.br"?: string;
  "focus.tl.x"?: string;
  "focus.tl.y"?: string;
  "focus.br.x"?: string;
  "focus.br.y"?: string;
  "img-style"?: string;
  // Native img attributes (with img- prefix)
  "img-alt"?: string;
  "img-loading"?: "lazy" | "eager";
  "img-title"?: string;
  "img-draggable"?: boolean | "true" | "false";
  "img-crossorigin"?: "anonymous" | "use-credentials" | "";
  "img-decoding"?: "async" | "sync" | "auto";
  "img-fetchpriority"?: "high" | "low" | "auto";
}

// TypeScript type declarations for JSX/TSX support
type JSXBase = JSX.IntrinsicElements extends { span: unknown }
  ? JSX.IntrinsicElements
  : Record<string, Record<string, unknown>>;

declare global {
  interface Window {
    AutoImgAPI: AutoImgAPI;
    AutoImgElement: typeof AutoImgElement;
  }

  interface HTMLElementTagNameMap {
    "auto-img": AutoImgElement;
  }

  namespace JSX {
    interface IntrinsicElements {
      "auto-img": JSXBase["div"] &
        Partial<Omit<AutoImgElement, keyof HTMLElement>> &
        AutoImgAttributes;
    }
  }
}

export { AutoImgElement, AutoImgAPI, autoImgAPI };
