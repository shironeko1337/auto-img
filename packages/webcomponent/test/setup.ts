// Mock ResizeObserver for jsdom environment
class ResizeObserverMock {
  private callback: ResizeObserverCallback;
  private observedElements: Map<Element, any> = new Map();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    this.observedElements.set(target, true);
    // Trigger an initial callback with the element's dimensions
    setTimeout(() => {
      if (this.observedElements.has(target)) {
        const rect = target.getBoundingClientRect();
        const entry: ResizeObserverEntry = {
          target: target as any,
          contentRect: {
            width: rect.width || 400,
            height: rect.height || 300,
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            bottom: rect.height || 300,
            right: rect.width || 400,
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
  private targetNode: Node | null = null;
  private config: MutationObserverInit | null = null;

  constructor(callback: MutationCallback) {
    this.callback = callback;
  }

  observe(target: Node, options?: MutationObserverInit) {
    this.targetNode = target;
    this.config = options || null;

    // Override appendChild and removeChild to trigger callbacks
    if (target && 'appendChild' in target && 'removeChild' in target) {
      const originalAppendChild = target.appendChild.bind(target);
      const originalRemoveChild = target.removeChild.bind(target);

      (target as any).appendChild = (node: Node) => {
        const result = originalAppendChild(node);
        setTimeout(() => {
          if (this.config?.childList) {
            const mutation: MutationRecord = {
              type: 'childList',
              target: target,
              addedNodes: [node] as any,
              removedNodes: [] as any,
              previousSibling: null,
              nextSibling: null,
              attributeName: null,
              attributeNamespace: null,
              oldValue: null,
            };
            this.callback([mutation], this as any);
          }
        }, 0);
        return result;
      };

      (target as any).removeChild = (node: Node) => {
        const result = originalRemoveChild(node);
        setTimeout(() => {
          if (this.config?.childList) {
            const mutation: MutationRecord = {
              type: 'childList',
              target: target,
              addedNodes: [] as any,
              removedNodes: [node] as any,
              previousSibling: null,
              nextSibling: null,
              attributeName: null,
              attributeNamespace: null,
              oldValue: null,
            };
            this.callback([mutation], this as any);
          }
        }, 0);
        return result;
      };
    }
  }

  disconnect() {
    this.targetNode = null;
    this.config = null;
  }

  takeRecords(): MutationRecord[] {
    return [];
  }
}

// Install mocks globally
global.ResizeObserver = ResizeObserverMock as any;
global.MutationObserver = MutationObserverMock as any;
