/**
 * Coordinates, top left is 0,0, bottom right is +x, +y
 */
export class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  copy() {
    return new Point(this.x, this.y);
  }

  static fromPercentage(
    xPercentage: number | string,
    yPercentage: number | string,
    rect: Rect
  ) {
    return new Point(
      (Number(xPercentage) / 100) * rect.width,
      (Number(yPercentage) / 100) * rect.height
    );
  }

  shift(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
  }
}

/**
 * A rectangle area.
 */
export class Rect {
  tl: Point;
  br: Point;

  constructor(tl: Point, br: Point) {
    this.tl = tl;
    this.br = br;
    // TODO validate tl and br values
  }

  copy() {
    return new Rect(this.tl.copy(), this.br.copy());
  }

  /**
   * Move until center overlaps with target and return the shift.
   */
  moveCenter(target: Rect): [number, number] {
    const center = this.center,
      targetCenter = target.center;
    const shiftX = targetCenter.x - center.x,
      shiftY = targetCenter.y - center.y;
    this.shift(shiftX, shiftY);
    return [shiftX, shiftY];
  }

  static fromDimension(width: number, height: number) {
    return new Rect(new Point(0, 0), new Point(width, height));
  }

  static fromCornerPosition(
    topLeftX: number,
    topLeftY: number,
    bottomRightX: number,
    bottomRightY: number
  ) {
    return new Rect(
      new Point(topLeftX, topLeftY),
      new Point(bottomRightX, bottomRightY)
    );
  }

  get center() {
    return getPointAt(this.tl, this.br, 1 / 2);
  }
  get width() {
    return this.br.x - this.tl.x;
  }
  get height() {
    return this.br.y - this.tl.y;
  }

  shift(dx: number, dy: number) {
    this.tl.shift(dx, dy);
    this.br.shift(dx, dy);
  }

  /**
   * Scale the rectangle so that the anchor keeps the same position,
   * anchor would be the rectangle center if not specified.
   */
  scale(scaleX: number, scaleY: number, anchor?: Point) {
    const center = this.center;
    this.tl = getPointAt(this.tl, center, 1 - scaleX, 1 - scaleY);
    this.br = getPointAt(center, this.br, scaleX, scaleY);

    if (anchor) {
      const newAnchor = getPointAt(center, anchor, scaleX, scaleY);
      const [shiftX, shiftY] = [anchor.x - newAnchor.x, anchor.y - newAnchor.y];
      this.tl.shift(shiftX, shiftY);
      this.br.shift(shiftX, shiftY);
    }
  }
}

export type ImagePosition = {
  backgroundPosition: string;
  backgroundSize: string;
};

export class Image {
  rect: Rect;
  focus: Rect;
  container?: Rect;
  imageSrc?: string;

  constructor(rect: Rect, focus?: Rect, container?: Rect) {
    this.rect = rect;
    this.focus = focus || rect;
    if (container) {
      this.container = container;
    }
  }

  copy() {
    return new Image(
      this.rect.copy(),
      this.focus.copy(),
      this.container?.copy()
    );
  }

  startTransform(container: Rect) {
    this.container = container;
    const shift = this.rect.moveCenter(container);
    this.focus.shift.apply(this.focus, shift);
  }

  /**
   * Scale the image so that the anchor keeps the same position,
   * anchor would be the image center if not specified.
   */
  scale(scaleX: number, scaleY: number, anchor?: Point) {
    anchor ||= this.rect.center;
    this.rect.scale(scaleX, scaleY, anchor);
    this.focus.scale(scaleX, scaleY, anchor);
  }

  shift(dx: number, dy: number) {
    this.rect.shift(dx, dy);
    this.focus.shift(dx, dy);
  }

  /**
   * Assume current image rectangle represents a background of the given container,
   * and the rectangle starts transforming with center overlaps with the container,
   * return CSS Properties that get background position correct.
   */
  getCSSBackgroundProperties(): ImagePosition | null {
    if (!this.container) {
      return null;
    }

    const scaleX = (this.rect.width / this.container.width) * 100;
    const scaleY = (this.rect.height / this.container.height) * 100;
    const center = this.rect.center;
    const shiftX = center.x - this.container.center.x;
    const shiftY = center.y - this.container.center.y;
    const positionX =
      (100 * shiftX) / (this.container.width - this.rect.width) + 50;
    const positionY =
      (100 * shiftY) / (this.container.height - this.rect.height) + 50;

    return {
      backgroundPosition: `${positionX}% ${positionY}%`,
      backgroundSize: `${scaleX}% ${scaleY}%`,
    };
  }
}

/**
 * Get the point in between p1 and p2 by scale factors.
 */
function getPointAt(p1: Point, p2: Point, scaleX: number, scaleY?: number) {
  scaleY = scaleY || scaleX;

  return new Point(
    (p2.x - p1.x) * scaleX + p1.x,
    (p2.y - p1.y) * scaleY + p1.y
  );
}
