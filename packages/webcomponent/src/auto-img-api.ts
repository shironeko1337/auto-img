import { AutoImgModel } from "./base";

export interface AutoImgConfig {
  imageServer?: string;
  resizeRerender?: boolean;
  placeholder?: string | Record<string, string>;
  resizeThrottle?: number;
  loadPlaceholderTimeout?: number;
  loadImageTimeout?: number;
  defer?: boolean;
}

/**
 * AutoImg API for model based rendering.
 */
export class AutoImgAPI {
  config: AutoImgConfig = {
    resizeRerender: true,
    resizeThrottle: 300,
    loadPlaceholderTimeout: 100,
    loadImageTimeout: 300,
  };

  private elementModelMap: Map<HTMLElement, AutoImgModel> = new Map();
  // Cache for removed elements - allows restoration when re-added to DOM
  private removedElementCache: Map<HTMLElement, AutoImgModel> = new Map();
  // For remove resize listener on element remove.
  private mutationObserver: MutationObserver | null = null;
  // For auto resize on resizing event.
  private resizeObserver!: ResizeObserver;

  /**
   * 1. Check compability.
   * 2. Initialize resize observer and mutation observer.
   * 3. Load all element on DOM ready. It can be disabled by set `defer = true`
   *  or set `defer` at element level.
   */
  constructor(config: AutoImgConfig = {}) {
    if (typeof globalThis === "undefined" || typeof document === "undefined") {
      console.error(
        "autoimg-webcomponent: This library requires a browser environment with DOM support"
      );
      return;
    }

    this.resizeObserver = new ResizeObserver(this.handleResize);

    this.setupMutationObserver();

    this.config = { ...this.config, ...config };
  }

  /**
   * Scan the document and attach a model for each selected element.
   * When calling this method manually, we assume the user wants to load
   * `[data-auto-img]` elements instead of `<auto-img/>` elements.
   *
   * 1. When attaching a model, API also holds a map from element to model
   *    to react to resize event.
   * 2. The model itself reads all attrs, load images and render later
   *    (if it's deferred, no render).
   */
  loadAll(selector = "[data-auto-img]") {
    const onload = () => {
      document
        .querySelectorAll(selector)
        .forEach((e) => this.load(e as HTMLElement));
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onload);
    } else {
      onload();
    }
  }

  /**
   * Load a single html element to attach a model to it.
   */
  load(element: HTMLElement) {
    const model = this.attachModel(element);
    if (model.readAttrs()) {
      model.loadAndRender();
    }
  }

  /**
   * Manually render any supported element.
   *
   * @param waitResize: whether we wait until size is steady.
   *
   * There are two scenarios we should call render manually
   * 1. waitResize: true - Element or container is resizing and we want to render the image
   * at a specific point of time.
   *
   * 2. waitResize: false - A new image src is set (AutoImgAPI is unaware of that) and we
   * assume the container is not resizing.
   */
  async render(element: HTMLElement, waitResize = false) {
    let model: AutoImgModel;

    if (!this.elementModelMap.has(element)) {
      model = this.attachModel(element);
    } else {
      model = this.elementModelMap.get(element)!;
    }

    if (model.readAttrs()) {
      model.defer = false;

      if (waitResize) {
        await model.loadAndRender();
      } else {
        // temporarily set to true just to prevent render automatically
        // because we want to set isSizeSteady to true exactly before render.
        // this value is not set back to `false` or original value because
        // there is no way we can track if it's set during rendering or not (we don't have to).
        model.defer = true;
        await model.loadAndRender();
        model.isSizeSteady = true;
        await model.render();
        model.defer = false;
      }
    }
  }

  private attachModel(element: HTMLElement) {
    if (!this.elementModelMap.has(element)) {
      const model = new AutoImgModel(element, this);
      this.watch(element, model);
      return model;
    } else {
      return this.elementModelMap.get(element)!;
    }
  }

  /**
   * Handle resize with throttling
   */
  private handleResize = (entries: ResizeObserverEntry[]): void => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement;
      const { width, height } = entry.contentRect;
      this.elementModelMap.get(el)?.resizeState?.set({ width, height });
    }
  };

  /**
   * Watch the resizing event of an element, calling this function on a
   * non-deferred element could eventually cause it to be rendered since
   * resizeObserver handler would trigger the resizeState to be in a stable
   * value, then trigger onStable callback in the model.
   */
  private watch(element: HTMLElement, model: AutoImgModel) {
    this.resizeObserver.observe(element);
    this.elementModelMap.set(element, model);
  }

  private unwatch(element: HTMLElement) {
    this.resizeObserver.unobserve(element);
    this.removedElementCache.set(element, this.elementModelMap.get(element)!);
    this.elementModelMap.delete(element);
  }

  /**
   * Set up MutationObserver, a mutationObserver is for controlling which
   * elements we should watch resizing. There is a cache mechanism to prevent
   * loading image again for those removed and then added back elements.
   */
  private setupMutationObserver(): void {
    this.mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.removedNodes.forEach((node) => {
          if (node instanceof HTMLElement && this.elementModelMap.has(node)) {
            this.unwatch(node);
          }
        });

        mutation.addedNodes.forEach((node) => {
          if (
            node instanceof HTMLElement &&
            this.removedElementCache.has(node)
          ) {
            const model = this.removedElementCache.get(node)!;
            this.removedElementCache.delete(node);
            this.watch(node, model);
          }
        });
      }
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

export const autoImgAPI = new AutoImgAPI();
