import { AutoImgElement } from './auto-img-element';
import { AutoImg } from './auto-img-api';

// Auto-register the custom element
if (!customElements.get('auto-img')) {
  customElements.define('auto-img', AutoImgElement);
}

// Re-export AutoImg API and types
export { AutoImg };

// Make AutoImg available globally when used as IIFE
if (typeof globalThis !== 'undefined') {
  (globalThis as any).AutoImg = AutoImg;
}

// Attributes for auto-img element
interface AutoImgAttributes {
  src?: string;
  width?: string;
  height?: string;
  placeholder?: string;
  defer?: boolean | '';
  'allow-distortion'?: boolean | '';
  padding?: string | number;
  focus?: string;
  'focus.tl'?: string;
  'focus.br'?: string;
  'focus.tl.x'?: string;
  'focus.tl.y'?: string;
  'focus.br.x'?: string;
  'focus.br.y'?: string;
  'fetch-focus'?: boolean | '';
  'fetch-upscale'?: boolean | '';
}

// TypeScript type declarations for JSX/TSX support
type JSXBase = JSX.IntrinsicElements extends { span: unknown }
  ? JSX.IntrinsicElements
  : Record<string, Record<string, unknown>>;

declare global {
  interface Window {
    AutoImg: typeof AutoImg;
    AutoImgElement: typeof AutoImgElement;
  }

  interface HTMLElementTagNameMap {
    'auto-img': AutoImgElement;
  }

  namespace JSX {
    interface IntrinsicElements {
      'auto-img': JSXBase['div'] & Partial<Omit<AutoImgElement, keyof HTMLElement>> & AutoImgAttributes;
    }
  }
}


export { AutoImgElement };
