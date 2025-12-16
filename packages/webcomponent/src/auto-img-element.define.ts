import { AutoImgElement, setAutoImgAPI } from "./auto-img-element";
// Here we don't need the class for a singleton.
import { autoImgAPI as AutoImgAPI } from "./auto-img-api";

// Set the global API reference so elements can auto-attach models
setAutoImgAPI(AutoImgAPI);

// Auto-register the custom element
if (!customElements.get("auto-img")) {
  customElements.define("auto-img", AutoImgElement);
}

// Expose to window object for global access
if (typeof window !== "undefined") {
  (window as any).AutoImgAPI = AutoImgAPI;
  (window as any).AutoImgElement = AutoImgElement;
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
}

// TypeScript type declarations for JSX/TSX support
type JSXBase = JSX.IntrinsicElements extends { span: unknown }
  ? JSX.IntrinsicElements
  : Record<string, Record<string, unknown>>;

declare global {
  interface Window {
    AutoImgAPI: typeof AutoImgAPI;
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

export { AutoImgElement };
export { AutoImgAPI };
