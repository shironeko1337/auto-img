import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "../src/index";

describe("AutoImg", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    // container = document.createElement("div");
    // container.style.width = "400px";
    // container.style.height = "300px";
    // document.body.appendChild(container);
  });

  afterEach(() => {
    // document.body.removeChild(container);
  });

  describe("autoimg element", () => {
    it("should register custom element", () => {
      expect(customElements.get("auto-img")).toBeDefined();
    });
    it("should auto attach a model to autoimg element", () => {});
    it("should treat width and height as 100% when not defined", () => {});
    it("should use width and height as CSS properties for container as long as they are valid string values", () => {});
  });

  describe("native html element", () => {
    it("should ignore ", () => {});
    it("should use data-auto-img-src for native elements", () => {});

    it("should use background-image for native elements when data-auto-img-src is not defined", () => {});

    it("should ignore width and height", () => {});
  });

  describe("Basic model", () => {
    describe("read attributes", () => {
      it("should read all attributes into model", () => {});
      it("should use config when placeholder is not defined", () => {});
    });
    it("should render image when image is loaded and size is stable", () => {});

    it("should not render image when image is not loaded", () => {});

    it("should not render image when size is not stable", () => {});

    it("should pass the correct centralizer inputs to centralizer instance", () => {});

    describe("when deferred is set", () => {
      it("should not render image when image loaded for the first time and size is ready", () => {});
      it("should not render image when size is ready for the first time and image is loaded", () => {});
    });

    describe("focus area", () => {
      it("should get the correct focus area by focus corners", () => {});

      it("should get the correct focus area by focus center when size is stable", () => {});
    });

    it("should require src for autoimg", () => {});
  });

  describe("API", () => {
    it("should load all custom elements after loading as long as library is included", () => {});

    it('should load all specified elements by selector on calling "load" ', () => {});

    it("should have a map between model and element after loading", () => {});

    it("should remove the model element mapping when element is removed", () => {});

    it("should add the model back to the element entry when element is added back", () => {});

    it("should update element's resize state when resizing", () => {});

    it(
      "it should render element immediately even if the resize state is" +
        "not marked as stable when calling render with waitResize = true",
      () => {}
    );

    it(
      "it should render element until element size is stable" +
        "when calling render with waitResize = false",
      () => {}
    );
  });

  describe("Deferred Rendering", () => {
    //   it("should not auto-render when defer attribute is present", () => {
    //     const element = document.createElement("auto-img") as any;
    //     element.setAttribute(
    //       "src",
    //       "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    //     );
    //     element.setAttribute("defer", "");
    //     container.appendChild(element);
    //     // Should have defer attribute
    //     expect(element.hasAttribute("defer")).toBe(true);
    //   });
  });
});
