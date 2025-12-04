import type { AutoImgElement } from "./auto-img-element";
import { AutoImgModel, MutableState, PixelSize } from "./base";

export interface AutoImgConfig {
  imageServer?: string;
  resizeRerender?: boolean;
  placeholder?: string | Record<string, string>;
  resizeThrottle?: number;
  loadPlaceholderTimeout: number;
  loadImageTimeout: number;
}

export class AutoImgAPI {
  config: AutoImgConfig = {
    resizeRerender: true,
    resizeThrottle: 300,
    loadPlaceholderTimeout: 100,
    loadImageTimeout: 300,
  };

  private elementModelMap: Map<HTMLElement, AutoImgModel> = new Map();
  private mutationObserver: MutationObserver | null = null;
  private resizeObserver!: ResizeObserver;

  constructor() {
    // Check if running in browser environment
    if (typeof globalThis === "undefined" || typeof document === "undefined") {
      console.error(
        "autoimg-webcomponent: This library requires a browser environment with DOM support"
      );
      return;
    }

    this.resizeObserver = new ResizeObserver(this.handleResize);

    // Set up MutationObserver to auto-cleanup when elements are removed from DOM
    this.setupMutationObserver();
  }

  /**
   * Initialize or update global configuration
   */
  init(config: AutoImgConfig) {
    this.config = { ...this.config, ...config };
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
   * Scan the document and attach a model, for each element
   * 1. Watch the resizing event and attach a callback when size is steady.
   * 2. Read attrs and maybe render.
   */
  scan() {
    document.querySelectorAll("auto-img,[data-auto-img]").forEach((e) => {
      const model = this.attachModel(e as HTMLElement);
      model.readSyncAttrs();
      model.loadAndListen();
    });
  }

  /**
   * Manually render a element.
   * waitResize: whether we wait until size is steady.
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

    model.readSyncAttrs();
    model.defer = false;

    if (waitResize) {
      await model.loadAndListen();
    } else {
      // temporarily set to true just to prevent render automatically
      // because we want to set isSizeSteady to true exactly before render.
      // this value is not set back to `false` or original value because
      // there is no way we can track if it's set during rendering or not (we don't have to).
      model.defer = true;
      await model.loadAndListen();
      model.isSizeSteady = true;
      await model.render();
      model.defer = false;
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

  private watch(element: HTMLElement, model: AutoImgModel) {
    this.resizeObserver.observe(element);
    this.elementModelMap.set(element, model);
  }

  private unwatch(element: HTMLElement) {
    this.resizeObserver.unobserve(element);
    this.elementModelMap.delete(element);
  }

  /**
   * Set up MutationObserver to automatically clean up removed elements
   */
  private setupMutationObserver(): void {
    this.mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.removedNodes.forEach((node) => {
          if (node instanceof HTMLElement && this.elementModelMap.has(node)) {
            this.unwatch(node);
          }
        });
      }
    });

    // Observe the entire document for node removals
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

export const AutoImg = new AutoImgAPI();
