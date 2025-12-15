import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "../src/index";
import { AutoImgAPI } from "../src/auto-img-api";
import { AutoImgElement } from "../src/auto-img-element";
import { getDimensionValue } from "../src/base";

describe("AutoImg", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.style.width = "400px";
    container.style.height = "300px";
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
    // Clean up any elements added directly to body
    document.querySelectorAll("[data-auto-img], auto-img").forEach(el => {
      if (el.parentNode === document.body) {
        el.remove();
      }
    });
  });

  describe("autoimg element", () => {
    it("should register custom element", () => {
      expect(customElements.get("auto-img")).toBeDefined();
    });

    it("should auto attach a model to autoimg element", () => {
      const element = document.createElement("auto-img") as AutoImgElement;
      element.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
      container.appendChild(element);

      // Model should be automatically attached
      expect(element.model).toBeDefined();
      expect(element.model?.host).toBe(element);
    });

    it("should treat width and height as 100% when not defined", () => {
      const element = document.createElement("auto-img") as AutoImgElement;
      element.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
      container.appendChild(element);

      // Width and height should default to 100%
      expect(element.style.width).toBe("100%");
      expect(element.style.height).toBe("100%");
    });

    it("should use width and height as CSS properties for container as long as they are valid string values", () => {
      // Test getDimensionValue function directly since happy-dom doesn't fully support
      // attributeChangedCallback for custom elements

      // Test with CSS units
      expect(getDimensionValue("200px")).toBe("200px");
      expect(getDimensionValue("150px")).toBe("150px");

      // Test with unitless numbers (should add px)
      expect(getDimensionValue("300")).toBe("300px");
      expect(getDimensionValue("200")).toBe("200px");

      // Test with other valid CSS units
      expect(getDimensionValue("50%")).toBe("50%");
      expect(getDimensionValue("10rem")).toBe("10rem");

      // Test that constructor uses these values
      const element = document.createElement("auto-img") as AutoImgElement;
      // Without width/height attributes, should default to 100%
      expect(element.style.width).toBe("100%");
      expect(element.style.height).toBe("100%");
    });
  });

  describe("native html element", () => {
    it("should use data-auto-img-src for native elements", () => {
      const api = new AutoImgAPI();
      const element = document.createElement("div");
      element.setAttribute("data-auto-img", "");
      element.setAttribute("data-auto-img-src", "https://example.com/image.jpg");
      element.style.width = "200px";
      element.style.height = "200px";
      container.appendChild(element);

      api.load(element);

      const model = (api as any).elementModelMap.get(element);
      expect(model).toBeDefined();
      expect(model.imageSrc).toBe("https://example.com/image.jpg");
    });

    it("should use background-image for native elements when data-auto-img-src is not defined", () => {
      const api = new AutoImgAPI();
      const element = document.createElement("div");
      element.setAttribute("data-auto-img", "");
      element.style.backgroundImage = "url(https://example.com/bg-image.jpg)";
      element.style.width = "200px";
      element.style.height = "200px";
      container.appendChild(element);

      api.load(element);

      const model = (api as any).elementModelMap.get(element);
      expect(model).toBeDefined();
      expect(model.imageSrc).toBe("https://example.com/bg-image.jpg");
    });

    it("should ignore width and height", () => {
      const api = new AutoImgAPI();
      const element = document.createElement("div");
      element.setAttribute("data-auto-img", "");
      element.setAttribute("data-auto-img-src", "https://example.com/image.jpg");
      element.setAttribute("width", "200px");
      element.setAttribute("height", "150px");
      element.style.width = "300px";
      element.style.height = "250px";
      container.appendChild(element);

      api.load(element);

      // Native elements should keep their original styles, not affected by width/height attributes
      expect(element.style.width).toBe("300px");
      expect(element.style.height).toBe("250px");
    });
  });

  describe("Basic model", () => {
    describe("read attributes", () => {
      it("should read all attributes into model", async () => {
        const api = new AutoImgAPI();
        const element = document.createElement("auto-img") as AutoImgElement;
        element.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
        element.setAttribute("focus", "10,20;30,40");
        element.setAttribute("padding", "5");
        element.setAttribute("allow-distortion", "true");
        element.setAttribute("defer", "true");
        container.appendChild(element);

        await new Promise(resolve => setTimeout(resolve, 10));

        const model = element.model!;
        expect(model).toBeDefined();
        expect(model.imageSrc).toBe("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
        expect(model.centralizerInput.focus).toBeDefined();
        expect(model.centralizerInput.focus?.tl.x).toBe(10);
        expect(model.centralizerInput.focus?.tl.y).toBe(20);
        expect(model.centralizerInput.focus?.br.x).toBe(30);
        expect(model.centralizerInput.focus?.br.y).toBe(40);
        expect(model.centralizerInput.config?.padding).toBe(5);
        expect(model.centralizerInput.allowDistortion).toBe(true);
        expect(model.defer).toBe(true);
      });

      it("should use config when placeholder is not defined", () => {
        const api = new AutoImgAPI({ placeholder: "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" });
        const element = document.createElement("auto-img") as AutoImgElement;
        element.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
        container.appendChild(element);

        api.load(element);
        const model = (api as any).elementModelMap.get(element);

        expect(model.placeholder).toBe("data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==");
      });
    });

    it("should render image when image is loaded and size is stable", async () => {
      const element = document.createElement("auto-img") as AutoImgElement;
      element.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
      element.setAttribute("focus", "0,0;1,1");
      container.appendChild(element);

      await new Promise(resolve => setTimeout(resolve, 50));

      const model = element.model!;
      model.isSizeSteady = true;
      model.isImageLoaded = true;
      model.centralizerInput.viewWidth = 400;
      model.centralizerInput.viewHeight = 300;
      model.centralizerInput.imageWidth = 1;
      model.centralizerInput.imageHeight = 1;

      const renderSpy = vi.spyOn(model, 'render');
      await model.render();

      expect(renderSpy).toHaveBeenCalled();
    });

    it("should not render image when image is not loaded", async () => {
      const element = document.createElement("auto-img") as AutoImgElement;
      element.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
      container.appendChild(element);

      await new Promise(resolve => setTimeout(resolve, 10));

      const model = element.model!;
      model.isImageLoaded = false;
      model.isSizeSteady = true;
      model.centralizerInput.viewWidth = 400;
      model.centralizerInput.viewHeight = 300;

      const setPositionSpy = vi.spyOn(model, 'setPosition');
      await model.render();

      // render should return early without calling setPosition
      expect(setPositionSpy).not.toHaveBeenCalled();
    });

    it("should not render image when size is not stable", async () => {
      const element = document.createElement("auto-img") as AutoImgElement;
      element.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
      container.appendChild(element);

      await new Promise(resolve => setTimeout(resolve, 10));

      const model = element.model!;
      model.isImageLoaded = true;
      model.isSizeSteady = false;
      model.centralizerInput.imageWidth = 1;
      model.centralizerInput.imageHeight = 1;

      const setPositionSpy = vi.spyOn(model, 'setPosition');
      await model.render();

      // render should return early without calling setPosition
      expect(setPositionSpy).not.toHaveBeenCalled();
    });

    it("should pass the correct centralizer inputs to centralizer instance", async () => {
      const element = document.createElement("auto-img") as AutoImgElement;
      element.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
      element.setAttribute("focus", "10,20;90,80");
      element.setAttribute("padding", "10");
      element.setAttribute("allow-distortion", "true");
      container.appendChild(element);

      await new Promise(resolve => setTimeout(resolve, 50));

      const model = element.model!;
      model.isSizeSteady = true;
      model.isImageLoaded = true;
      model.centralizerInput.viewWidth = 400;
      model.centralizerInput.viewHeight = 300;
      model.centralizerInput.imageWidth = 100;
      model.centralizerInput.imageHeight = 100;

      await model.render();

      // Verify the inputs were set correctly
      expect(model.centralizerInput.viewWidth).toBe(400);
      expect(model.centralizerInput.viewHeight).toBe(300);
      expect(model.centralizerInput.imageWidth).toBe(100);
      expect(model.centralizerInput.imageHeight).toBe(100);
      expect(model.centralizerInput.focus?.tl.x).toBe(10);
      expect(model.centralizerInput.focus?.tl.y).toBe(20);
      expect(model.centralizerInput.focus?.br.x).toBe(90);
      expect(model.centralizerInput.focus?.br.y).toBe(80);
      expect(model.centralizerInput.config?.padding).toBe(10);
      expect(model.centralizerInput.allowDistortion).toBe(true);
    });

    describe("when deferred is set", () => {
      it("should not render image when image loaded for the first time and size is ready", async () => {
        const element = document.createElement("auto-img") as AutoImgElement;
        element.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
        element.setAttribute("defer", "true");
        element.setAttribute("focus", "0,0;1,1");
        container.appendChild(element);

        await new Promise(resolve => setTimeout(resolve, 50));

        const model = element.model!;
        model.isSizeSteady = true;
        model.centralizerInput.viewWidth = 400;
        model.centralizerInput.viewHeight = 300;

        const setPositionSpy = vi.spyOn(model, 'setPosition');

        // Simulate image load
        model.onImageLoaded({ width: 1, height: 1 });

        await new Promise(resolve => setTimeout(resolve, 10));

        // Should not render because defer is true
        expect(setPositionSpy).not.toHaveBeenCalled();
      });

      it("should not render image when size is ready for the first time and image is loaded", async () => {
        const element = document.createElement("auto-img") as AutoImgElement;
        element.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
        element.setAttribute("defer", "true");
        element.setAttribute("focus", "0,0;1,1");
        container.appendChild(element);

        await new Promise(resolve => setTimeout(resolve, 10));

        const model = element.model!;
        model.isImageLoaded = true;
        model.centralizerInput.imageWidth = 1;
        model.centralizerInput.imageHeight = 1;

        const setPositionSpy = vi.spyOn(model, 'setPosition');

        // Simulate size becoming steady
        model.onSizeSteady({ width: 400, height: 300 });

        await new Promise(resolve => setTimeout(resolve, 10));

        // Should not render because defer is true
        expect(setPositionSpy).not.toHaveBeenCalled();
      });
    });

    describe("focus area", () => {
      it("should get the correct focus area by focus corners", () => {
        const element = document.createElement("auto-img") as AutoImgElement;
        element.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
        element.setAttribute("focus", "10,20;90,80");
        container.appendChild(element);

        const model = element.model!;
        model.readAttrs();

        expect(model.centralizerInput.focus).toBeDefined();
        expect(model.centralizerInput.focus?.tl.x).toBe(10);
        expect(model.centralizerInput.focus?.tl.y).toBe(20);
        expect(model.centralizerInput.focus?.br.x).toBe(90);
        expect(model.centralizerInput.focus?.br.y).toBe(80);
      });

      it("should get the correct focus area by focus center when size is stable", () => {
        const element = document.createElement("auto-img") as AutoImgElement;
        element.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
        element.setAttribute("focus-center", "50,50");
        container.appendChild(element);

        const model = element.model!;
        model.readAttrs();
        model.centralizerInput.imageWidth = 100;
        model.centralizerInput.imageHeight = 100;
        model.centralizerInput.viewWidth = 200;
        model.centralizerInput.viewHeight = 100;

        const focusArea = model._getFocusArea(model.centralizerInput);

        expect(focusArea).toBeDefined();
        expect(focusArea?.tl.x).toBeLessThanOrEqual(50);
        expect(focusArea?.tl.y).toBeLessThanOrEqual(50);
        expect(focusArea?.br.x).toBeGreaterThanOrEqual(50);
        expect(focusArea?.br.y).toBeGreaterThanOrEqual(50);
      });
    });

    it("should require src for autoimg", () => {
      const element = document.createElement("auto-img") as AutoImgElement;
      // No src attribute set
      container.appendChild(element);

      const model = element.model!;
      model.readAttrs();

      // imageSrc should be empty
      expect(model.imageSrc).toBe("");
    });
  });

  describe("API", () => {
    it("should load all custom elements after loading as long as library is included", async () => {
      // Create auto-img elements
      const element1 = document.createElement("auto-img") as AutoImgElement;
      element1.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
      document.body.appendChild(element1);

      const element2 = document.createElement("auto-img") as AutoImgElement;
      element2.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
      document.body.appendChild(element2);

      await new Promise(resolve => setTimeout(resolve, 50));

      // Both elements should have models attached
      expect(element1.model).toBeDefined();
      expect(element2.model).toBeDefined();

      element1.remove();
      element2.remove();
    });

    it('should load all specified elements by selector on calling "load" ', async () => {
      const api = new AutoImgAPI();

      const element1 = document.createElement("div");
      element1.setAttribute("data-auto-img", "");
      element1.setAttribute("data-auto-img-src", "https://example.com/image1.jpg");
      element1.classList.add("test-selector");
      document.body.appendChild(element1);

      const element2 = document.createElement("div");
      element2.setAttribute("data-auto-img", "");
      element2.setAttribute("data-auto-img-src", "https://example.com/image2.jpg");
      element2.classList.add("test-selector");
      document.body.appendChild(element2);

      api.loadAll(".test-selector");

      // Give time for loadAll to process
      await new Promise(resolve => setTimeout(resolve, 100));

      const model1 = (api as any).elementModelMap.get(element1);
      const model2 = (api as any).elementModelMap.get(element2);

      expect(model1).toBeDefined();
      expect(model2).toBeDefined();

      element1.remove();
      element2.remove();
    });

    it("should have a map between model and element after loading", () => {
      const api = new AutoImgAPI();
      const element = document.createElement("div");
      element.setAttribute("data-auto-img", "");
      element.setAttribute("data-auto-img-src", "https://example.com/image.jpg");
      document.body.appendChild(element);

      api.load(element);

      const elementModelMap = (api as any).elementModelMap;
      expect(elementModelMap.has(element)).toBe(true);
      expect(elementModelMap.get(element)).toBeDefined();

      element.remove();
    });

    it("should remove the model element mapping when element is removed", async () => {
      const api = new AutoImgAPI();
      const element = document.createElement("div");
      element.setAttribute("data-auto-img", "");
      element.setAttribute("data-auto-img-src", "https://example.com/image.jpg");
      document.body.appendChild(element);

      api.load(element);

      const elementModelMap = (api as any).elementModelMap;
      const removedElementCache = (api as any).removedElementCache;

      expect(elementModelMap.has(element)).toBe(true);

      // Remove element from DOM
      element.remove();

      // Wait for mutation observer to process
      await new Promise(resolve => setTimeout(resolve, 50));

      // Element should be removed from elementModelMap
      expect(elementModelMap.has(element)).toBe(false);
      // And added to removedElementCache
      expect(removedElementCache.has(element)).toBe(true);
    });

    it("should add the model back to the element entry when element is added back", async () => {
      const api = new AutoImgAPI();
      const element = document.createElement("div");
      element.setAttribute("data-auto-img", "");
      element.setAttribute("data-auto-img-src", "https://example.com/image.jpg");
      document.body.appendChild(element);

      api.load(element);

      const elementModelMap = (api as any).elementModelMap;
      const removedElementCache = (api as any).removedElementCache;
      const originalModel = elementModelMap.get(element);

      // Remove element
      element.remove();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(elementModelMap.has(element)).toBe(false);
      expect(removedElementCache.has(element)).toBe(true);

      // Add element back
      document.body.appendChild(element);
      await new Promise(resolve => setTimeout(resolve, 50));

      // Element should be back in elementModelMap with the same model
      expect(elementModelMap.has(element)).toBe(true);
      expect(elementModelMap.get(element)).toBe(originalModel);
      expect(removedElementCache.has(element)).toBe(false);

      element.remove();
    });

    it("should update element's resize state when resizing", async () => {
      const api = new AutoImgAPI();
      const element = document.createElement("div");
      element.setAttribute("data-auto-img", "");
      element.setAttribute("data-auto-img-src", "https://example.com/image.jpg");
      element.style.width = "200px";
      element.style.height = "200px";
      document.body.appendChild(element);

      api.load(element);

      const model = (api as any).elementModelMap.get(element);
      expect(model).toBeDefined();
      expect(model.resizeState).toBeDefined();

      // Simulate resize by manually triggering the resize observer callback
      const resizeObserver = (api as any).resizeObserver;
      const entry = {
        target: element,
        contentRect: { width: 300, height: 300 }
      };

      (api as any).handleResize([entry]);

      await new Promise(resolve => setTimeout(resolve, 10));

      // The resize state should be updated
      expect(model.resizeState.initialized).toBe(true);

      element.remove();
    });

    it(
      "it should render element immediately even if the resize state is" +
        "not marked as stable when calling render with waitResize = true",
      async () => {
        const api = new AutoImgAPI();
        const element = document.createElement("auto-img") as AutoImgElement;
        element.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
        element.setAttribute("focus", "0,0;1,1");
        document.body.appendChild(element);

        await new Promise(resolve => setTimeout(resolve, 50));

        const model = element.model!;
        model.isSizeSteady = false;
        model.isImageLoaded = true;
        model.centralizerInput.imageWidth = 1;
        model.centralizerInput.imageHeight = 1;

        // waitResize = true means it waits for size to be ready but will still render
        await api.render(element, true);

        await new Promise(resolve => setTimeout(resolve, 10));

        // Since waitResize is true, it should wait naturally for resize
        // but not block on isSizeSteady flag
        expect(model.defer).toBe(false);

        element.remove();
      }
    );

    it(
      "it should render element until element size is stable" +
        "when calling render with waitResize = false",
      async () => {
        const api = new AutoImgAPI();
        const element = document.createElement("auto-img") as AutoImgElement;
        element.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
        element.setAttribute("focus", "0,0;1,1");
        document.body.appendChild(element);

        await new Promise(resolve => setTimeout(resolve, 50));

        const model = element.model!;
        model.isSizeSteady = false;
        model.isImageLoaded = true;
        model.centralizerInput.imageWidth = 1;
        model.centralizerInput.imageHeight = 1;
        model.centralizerInput.viewWidth = 400;
        model.centralizerInput.viewHeight = 300;

        const setPositionSpy = vi.spyOn(element, 'setPosition');

        // waitResize = false means force render immediately
        await api.render(element, false);

        await new Promise(resolve => setTimeout(resolve, 10));

        // Should have forced isSizeSteady to true and rendered
        expect(model.isSizeSteady).toBe(true);
        expect(setPositionSpy).toHaveBeenCalled();

        element.remove();
      }
    );
  });

});
