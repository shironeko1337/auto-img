// Mock ResizeObserver for jsdom environment
class ResizeObserverMock {
  private callback: ResizeObserverCallback;
  private observedElements: Set<Element> = new Set();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    this.observedElements.add(target);
    // Optionally trigger an initial callback
    setTimeout(() => {
      if (this.observedElements.has(target)) {
        const entry: ResizeObserverEntry = {
          target: target as any,
          contentRect: {
            width: 400,
            height: 300,
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            bottom: 300,
            right: 400,
          } as DOMRectReadOnly,
          borderBoxSize: [] as any,
          contentBoxSize: [] as any,
          devicePixelContentBoxSize: [] as any,
        };
        this.callback([entry], this as any);
      }
    }, 0);
  }

  unobserve(target: Element) {
    this.observedElements.delete(target);
  }

  disconnect() {
    this.observedElements.clear();
  }
}

// Mock MutationObserver for jsdom environment
class MutationObserverMock {
  private callback: MutationCallback;

  constructor(callback: MutationCallback) {
    this.callback = callback;
  }

  observe(target: Node, options?: MutationObserverInit) {
    // Mock implementation - doesn't actually observe
  }

  disconnect() {
    // Mock implementation
  }

  takeRecords(): MutationRecord[] {
    return [];
  }
}

// Install mocks globally
global.ResizeObserver = ResizeObserverMock as any;
global.MutationObserver = MutationObserverMock as any;
