import { iterateCartesianProduct } from "./util";
import { describe, it, expect } from "vitest";
import { page } from "vitest/browser";
import { Rect, Point, Image } from "./base";
import {
  AutoImgInput,
  Centralizer,
  CentralizerClass,
  TouchAndRecenterCentralizer,
  inputValidation,
} from "./centralizer";

/**
 * For testing purpose, we need to manually adjust the size of input image
 * at the beginning to test super large image. Also we need to have an
 * image to validate the result.
 */
export type TestInput = AutoImgInput & {
  initialScale?: number;
  imageSrc?: string;
};

// Helper to create an image with blue border and red focus area
async function createTestImage(
  imageWidth: number,
  imageHeight: number,
  focus: Rect
): Promise<string> {
  // Create a canvas to draw the test image
  const canvas = document.createElement("canvas");
  canvas.width = imageWidth;
  canvas.height = imageHeight;
  const ctx = canvas.getContext("2d")!;

  // Fill with white background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, imageWidth, imageHeight);

  // Draw blue border (5px wide)
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 5;
  ctx.strokeRect(2.5, 2.5, imageWidth - 5, imageHeight - 5);

  // Draw red focus area
  ctx.fillStyle = "red";
  ctx.fillRect(
    focus.tl.x as number,
    focus.tl.y as number,
    (focus.br.x as number) - (focus.tl.x as number),
    (focus.br.y as number) - (focus.tl.y as number)
  );

  // Convert canvas to data URL
  return canvas.toDataURL("image/png");
}

// Helper to setup and render the element
async function setup<C extends CentralizerClass>(
  input: TestInput,
  CentralizerClass: C
): Promise<HTMLDivElement> {
  const containerRect = Rect.fromDimension(input.viewWidth, input.viewHeight);
  const imageRect = Rect.fromDimension(input.imageWidth, input.imageHeight);
  const focusRect = input.focus;
  const config = input.config;
  const initialScale = input.initialScale || 1;
  const image = new Image(imageRect, focusRect);
  const allowDistortion = input.allowDistortion || false;

  image.scale(initialScale, initialScale, new Point(0, 0));

  const imageDataUrl = await createTestImage(
    image.rect.width,
    image.rect.height,
    image.focus
  );

  const centralizer: Centralizer = new CentralizerClass(image, containerRect);
  await centralizer.transform(allowDistortion, config);
  const { backgroundPosition, backgroundSize } = centralizer.getPosition();

  const containerElement = document.createElement("div");
  containerElement.className = "test-element";

  const style = document.createElement("style");
  style.textContent = `
  .test-element::after {
    content: "";
    display: block;
    height: 100%;
    width: 100%;
    opacity: .3;
    background: repeating-linear-gradient(45deg, #ccc 0 10px, #ddd 10px 20px);
  }
`;
  document.head.appendChild(style);
  containerElement.style.width = `${input.viewWidth}px`;
  containerElement.style.height = `${input.viewHeight}px`;
  containerElement.style.border = "1px solid black";
  containerElement.style.backgroundImage = `url(${imageDataUrl})`;
  containerElement.style.backgroundPosition = backgroundPosition;
  containerElement.style.backgroundSize = backgroundSize;
  containerElement.style.backgroundRepeat = "no-repeat";
  document.body.appendChild(containerElement);
  return containerElement;
}

async function takeSnapshot(element: HTMLDivElement): Promise<string> {
  return (await page.screenshot({ element, base64: true })).base64;
}

const TOUCH_AND_RECENTER_VARIANTS = [
  [{ value: { viewWidth: 600, viewHeight: 600 }, desc: "rect view" }],
  [
    {
      value: {
        imageWidth: 512,
        imageHeight: 512,
        focus: Rect.fromCornerPosition(64, 64, 448, 448),
      },
      desc: "center focus",
    },
    {
      value: {
        imageWidth: 512,
        imageHeight: 512,
        focus: Rect.fromCornerPosition(64, 64, 300, 200),
      },
      desc: "top left focus",
    },
    {
      value: {
        imageWidth: 512,
        imageHeight: 512,
        focus: Rect.fromCornerPosition(64, 64, 200, 180),
      },
      desc: "top left focus not including center",
    },
  ],
  [
    { value: { config: { padding: 5 } }, desc: "5px padding" },
    { value: { config: { padding: 0 } }, desc: "no padding" },
  ],
  [
    { value: { initialScale: 0.5 }, desc: "small image" },
    { value: { initialScale: 1 }, desc: "original image" },
    { value: { initialScale: 2 }, desc: "large image" },
  ],
  [
    { value: { allowDistortion: true }, desc: "allow distortion" },
    { value: { allowDistortion: false }, desc: "don't allow distortion" },
  ],
];

/**
 * Test core functionality over each centralizer for given variants.
 */
describe("core functionality", () => {
  const centralizers = [TouchAndRecenterCentralizer];
  const variants = TOUCH_AND_RECENTER_VARIANTS;

  iterateCartesianProduct(variants, (comb: any) => {
    const input: any = {};
    let descs: string[] = [];

    comb.forEach((i: number, j: number) => {
      const item = variants[j][i];
      Object.assign(input, item.value);
      descs.push(item.desc);
    });

    const desc = descs.join(" and ");
    // Create a copy of input to avoid closure issues
    const inputCopy = JSON.parse(JSON.stringify(input));
    inputCopy.focus = Rect.fromCornerPosition(
      input.focus.tl.x,
      input.focus.tl.y,
      input.focus.br.x,
      input.focus.br.y
    );
    // console.log(input);

    for (const centralizer of centralizers) {
      it(`renders correctly for ${centralizer.name} with ${desc}`, async () => {
        const element = await setup(inputCopy, centralizer);
        // nextTick
        await new Promise<void>((r) => setTimeout(() => r(), 100));
        const snapshot = await takeSnapshot(element);

        document.body.removeChild(element);
        expect(snapshot).toMatchSnapshot();
      });
    }
  });
});

describe("inputValidation", () => {
  const validInput: Partial<AutoImgInput> = {
    viewWidth: 400,
    viewHeight: 300,
    imageWidth: 800,
    imageHeight: 600,
    focus: new Rect(new Point(100, 100), new Point(700, 500)),
    config: { padding: 10 },
  };

  it("should pass validation for valid input", () => {
    const errors = inputValidation(validInput);
    expect(errors).toHaveLength(0);
  });

  it("should fail when padding is negative", () => {
    const input = {
      ...validInput,
      config: { padding: -5 },
    };
    const errors = inputValidation(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("non-negative");
  });

  it("should fail when padding >= min(imageWidth, imageHeight)", () => {
    const input = {
      ...validInput,
      imageWidth: 100,
      imageHeight: 200,
      config: { padding: 100 },
    };
    const errors = inputValidation(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("must be less than");
  });

  it("should fail when focus top-left is outside image bounds", () => {
    const input = {
      ...validInput,
      focus: new Rect(new Point(-10, 50), new Point(700, 500)),
    };
    const errors = inputValidation(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("top-left");
    expect(errors[0]).toContain("non-negative");
  });

  it("should fail when focus bottom-right is outside image bounds", () => {
    const input = {
      ...validInput,
      imageWidth: 800,
      imageHeight: 600,
      focus: new Rect(new Point(100, 100), new Point(900, 500)),
    };
    const errors = inputValidation(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("bottom-right");
    expect(errors[0]).toContain("within image bounds");
  });

  it("should fail when focus rectangle is invalid (tl >= br)", () => {
    const input = {
      ...validInput,
      focus: new Rect(new Point(700, 100), new Point(100, 500)),
    };
    const errors = inputValidation(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("invalid");
  });

  it("should pass when padding is undefined", () => {
    const input = {
      ...validInput,
      config: {},
    };
    const errors = inputValidation(input);
    expect(errors).toHaveLength(0);
  });

  it("should pass when focus is undefined", () => {
    const input = {
      viewWidth: 400,
      viewHeight: 300,
      imageWidth: 800,
      imageHeight: 600,
      config: { padding: 10 },
    };
    const errors = inputValidation(input);
    expect(errors).toHaveLength(0);
  });
});
