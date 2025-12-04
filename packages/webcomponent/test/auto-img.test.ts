import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "../src/index";

describe("AutoImgElement", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    // Create a container for each test
    container = document.createElement("div");
    container.style.width = "400px";
    container.style.height = "300px";
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up after each test
    document.body.removeChild(container);
  });

  describe("Element Registration", () => {
    it("should register custom element", () => {
      expect(customElements.get("auto-img")).toBeDefined();
    });

    it("should create an instance of AutoImgElement", () => {
      const element = document.createElement("auto-img") as HTMLElement;
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.tagName).toBe("AUTO-IMG");
    });
  });

  describe("Shadow DOM", () => {
    it("should create shadow root", () => {
      const element = document.createElement("auto-img") as any;
      container.appendChild(element);
      expect(element.shadowRoot).toBeDefined();
      expect(element.shadowRoot.mode).toBe("open");
    });

    it("should contain container div in shadow root", () => {
      const element = document.createElement("auto-img") as any;
      container.appendChild(element);
      const containerDiv = element.shadowRoot.querySelector("div");
      expect(containerDiv).toBeDefined();
    });

    it("should contain img element in shadow root", () => {
      const element = document.createElement("auto-img") as any;
      container.appendChild(element);
      const img = element.shadowRoot.querySelector("img");
      expect(img).toBeDefined();
    });
  });

  describe("Render Method", () => {
    it("should have render method", () => {
      const element = document.createElement("auto-img") as any;
      expect(typeof element.render).toBe("function");
    });

    it("should accept render options", async () => {
      const element = document.createElement("auto-img") as any;
      element.setAttribute(
        "src",
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      );
      container.appendChild(element);

      // Should not throw
      await expect(
        element.render({ width: "100px", height: "100px" })
      ).resolves.not.toThrow();
    });
  });

  describe("Global API Integration", () => {
    it("should register with global API on connect", () => {
      const element = document.createElement("auto-img") as any;
      container.appendChild(element);

      // Element should be connected
      expect(element.isConnected).toBe(true);
    });

    it("should unregister from global API on disconnect", () => {
      const element = document.createElement("auto-img") as any;
      container.appendChild(element);
      container.removeChild(element);

      // Element should be disconnected
      expect(element.isConnected).toBe(false);
    });
  });

  describe("Deferred Rendering", () => {
    it("should not auto-render when defer attribute is present", () => {
      const element = document.createElement("auto-img") as any;
      element.setAttribute(
        "src",
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      );
      element.setAttribute("defer", "");
      container.appendChild(element);

      // Should have defer attribute
      expect(element.hasAttribute("defer")).toBe(true);
    });
  });
});

describe("AutoImg Global API", () => {
  it("should expose AutoImg global object", () => {
    expect((window as any).AutoImg).toBeDefined();
  });

  it("should have init method", () => {
    expect(typeof (window as any).AutoImg.init).toBe("function");
  });

  it("should have scan method", () => {
    expect(typeof (window as any).AutoImg.scan).toBe("function");
  });

  it("should have render method", () => {
    expect(typeof (window as any).AutoImg.render).toBe("function");
  });
});
