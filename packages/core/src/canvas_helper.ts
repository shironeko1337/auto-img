/**
 * Draws a rectangle on canvas. Uses difference blend mode when no color specified.
 */
export function drawRectangle(
  canvas: HTMLCanvasElement,
  topLeftX: number,
  topLeftY: number,
  bottomRightX: number,
  bottomRightY: number,
  style?: { borderWidth?: number; borderColor?: string }
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const borderWidth = style?.borderWidth ?? 2;
  const borderColor = style?.borderColor;

  if (borderColor === undefined) {
    ctx.globalCompositeOperation = "difference";
    ctx.strokeStyle = "white";
  } else {
    ctx.strokeStyle = borderColor;
  }
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(
    topLeftX,
    topLeftY,
    bottomRightX - topLeftX,
    bottomRightY - topLeftY
  );
  if (borderColor === undefined) {
    ctx.globalCompositeOperation = "source-over";
  }
}

/**
 * Enables interactive rectangle drawing on a canvas.
 * Click to set start point, move to preview, click again to complete.
 * Calls onComplete with normalized coordinates (topLeft to bottomRight).
 */
export class CanvasHelper {
  canvas: HTMLCanvasElement;
  imageData: ImageData | null = null;
  imageSrc?: string;
  private ctx: CanvasRenderingContext2D | null;
  private state: "pending" | "drawing" = "pending";
  private startX = 0;
  private startY = 0;
  private clickStartTs = 0;
  private style?: { borderWidth?: number; borderColor?: string };

  constructor(canvas: HTMLCanvasElement, imageSrc?: string) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.imageSrc = imageSrc;
  }

  private saveCanvas() {
    if (this.ctx) {
      this.imageData = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
    }
  }

  private restoreCanvas() {
    if (this.imageData && this.ctx) {
      this.ctx.putImageData(this.imageData, 0, 0);
    }
  }

  drawPreviewRectangle(x1: number, y1: number, x2: number, y2: number) {
    this.restoreCanvas();
    drawRectangle(this.canvas, x1, y1, x2, y2, this.style);
  }

  private getMousePos(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  withRectangleDraw(
    onComplete: (
      topLeftX: number,
      topLeftY: number,
      bottomRightX: number,
      bottomRightY: number
    ) => any,
    initialRectangle?: {
      topLeftX: number;
      topLeftY: number;
      bottomRightX: number;
      bottomRightY: number;
    },
    style?: { borderWidth?: number; borderColor?: string }
  ) {
    if (!this.ctx) return;

    this.style = style;

    // Draw initial rectangle if provided, then save state
    if (initialRectangle) {
      this.saveCanvas();
      drawRectangle(
        this.canvas,
        initialRectangle.topLeftX,
        initialRectangle.topLeftY,
        initialRectangle.bottomRightX,
        initialRectangle.bottomRightY,
        style
      );
    }

    const setCorner = (e: MouseEvent) => {
      const pos = this.getMousePos(e);

      if (this.state === "pending") {
        // Clean up previous rectangle before saving new canvas state
        this.restoreCanvas();
        this.saveCanvas();
        this.startX = pos.x;
        this.startY = pos.y;
        this.state = "drawing";
      } else {
        // Normalize coordinates so topLeft is always min and bottomRight is max
        const topLeftX = Math.min(this.startX, pos.x);
        const topLeftY = Math.min(this.startY, pos.y);
        const bottomRightX = Math.max(this.startX, pos.x);
        const bottomRightY = Math.max(this.startY, pos.y);

        this.state = "pending";
        onComplete(topLeftX, topLeftY, bottomRightX, bottomRightY);
      }
    };

    this.canvas.addEventListener("mousedown", (e) => {
      this.clickStartTs = new Date().getTime();
      setCorner(e);
    });

    this.canvas.addEventListener("mouseup", (e) => {
      const clickDuration = new Date().getTime() - this.clickStartTs;

      // ignore double click and mouse up is only for ending drawing
      if (clickDuration > 300 && this.state === "drawing") {
        setCorner(e);
      }
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (this.state === "drawing") {
        const pos = this.getMousePos(e);
        this.drawPreviewRectangle(this.startX, this.startY, pos.x, pos.y);
      }
    });
  }
}
