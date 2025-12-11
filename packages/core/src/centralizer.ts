import { Image, ImagePosition, Rect } from "./base";

/**
 * All inputs required for render an auto-processed image.
 */
export type AutoImgInput = {
  viewWidth: number;
  viewHeight: number;
  imageWidth: number;
  imageHeight: number;
  focus: Rect;
  allowDistortion?: boolean;
  config: TouchAndRecenterCentralizerConfig;
};

export function inputValidation(input: Partial<AutoImgInput>) {
  const errors: string[] = [];
  const { viewWidth, viewHeight, imageWidth, imageHeight } = input;
  const nonEmptyContainerAndImage =
    typeof viewWidth == "number" &&
    viewWidth > 0 &&
    typeof viewHeight == "number" &&
    viewHeight > 0 &&
    typeof imageWidth == "number" &&
    imageWidth > 0 &&
    typeof imageHeight == "number" &&
    imageHeight > 0;

  if (nonEmptyContainerAndImage) {
  }
  return errors;
}

/**
 * A centralizer would transform an image with focus on a container in order
 * to centralize the focus.
 *
 * Transform starts with the image center and container center overlapping.
 *
 * A transform algorithm should have a config `allowDistortion` indicating whether
 * the image is allowed to adjust width/height ratio.
 *
 * `allowDistortion` is default to false.
 */
export abstract class Centralizer {
  image: Image;
  container: Rect;

  defaultPosition: ImagePosition = {
    backgroundPosition: "center",
    backgroundSize: "100% 100%",
  };

  constructor(image: Image, container: Rect) {
    this.image = image;
    this.container = container;
    this.image.startTransform(this.container);
  }

  abstract transform(
    allowDistortion: boolean,
    config?: any,
    visualizer?: any
  ): Promise<void>;

  getPosition(): ImagePosition {
    const position = this.image.getCSSBackgroundProperties();

    return position || this.defaultPosition;
  }
}

export type CentralizerClass = new (...args: any[]) => Centralizer;

/********************************* Begin centralizers ***********************************/

export type TouchAndRecenterCentralizerConfig = {
  /**
   * The minimum distance from any of the focus area border to container border when finished,
   * should be less than min(container.width, container.height) / 2 and non-negative.
   */
  padding?: number;
};

export class TouchAndRecenterCentralizer extends Centralizer {
  async transform(
    allowDistortion = false,
    config: TouchAndRecenterCentralizerConfig = {},
    visualizer: any = () => {}
  ) {
    const image = this.image.rect;
    const focus = this.image.focus;
    const container = this.container;
    await visualizer(this.image, "initial state", "initialized");

    // Move focus center to container center
    let [shiftX, shiftY] = focus.moveCenter(container);
    image.shift(shiftX, shiftY);
    await visualizer(this.image, "center moved");

    // Scale up / down to make focus border to have at least `padding`
    // distance to the border
    let { padding } = config;
    padding ||= 0;

    let scales: number[] = [
      ((focus.center.y - padding) / focus.height) * 2,
      ((container.height - focus.center.y - padding) / focus.height) * 2,
      ((focus.center.x - padding) / focus.width) * 2,
      ((container.width - focus.center.x - padding) / focus.width) * 2,
    ].filter((v) => !Number.isNaN(v) && v > 0);

    if (scales.length) {
      let scale = Math.min(...scales);
      this.image.scale(scale, scale, focus.center);
    }

    // Can we get rid of the blanks by shifting the image?
    const topSpace = Math.max(image.tl.y, 0),
      bottomSpace = Math.max(container.br.y - image.br.y, 0),
      leftSpace = Math.max(image.tl.x, 0),
      rightSpace = Math.max(container.br.x - image.br.x, 0);
    shiftY = Math.max(
      Math.min(bottomSpace, -image.tl.y),
      Math.min(topSpace, image.br.y - container.br.y)
    );
    shiftX = Math.max(
      Math.min(rightSpace, -image.tl.x),
      Math.min(leftSpace, image.br.x - container.br.x)
    );

    image.shift(-shiftX, -shiftY);
    await visualizer(this.image, "position adjusted to remove blank space");

    // At this step, if we still can't remove the blanks, but distortion is allowed
    // we stretch the image to fill in the blanks.

    if (allowDistortion) {
      await visualizer(this.image, "focus stretched");
      let scaleY =
        (Math.max(image.tl.y, 0) +
          Math.max(container.br.y - image.br.y, 0) +
          image.height) /
        image.height;
      let scaleX =
        (Math.max(image.tl.x, 0) +
          Math.max(container.br.x - image.br.x, 0) +
          image.width) /
        image.width;

      this.image.scale(scaleX, scaleY, focus.center);
      await visualizer(
        this.image,
        "image stretched to remove blank space",
        "end"
      );
    } else {
      await visualizer(this.image, "focus stretched", "end");
    }
  }
}
