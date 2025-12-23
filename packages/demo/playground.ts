import {
  Rect,
  Point,
  Image,
  TouchAndRecenterCentralizer,
  Centralizer,
  CentralizerClass,
  TestInput,
} from "@shironeko1052/autoimg-core";
import { CanvasHelper } from "./canvas_helper";

// Centralized CSS styles
const VISUALIZE_STYLES = `
  button {
    justify-content:center;
  }

  label {
    width: 100%;
  }

  .hidden {
    display: none!important;
  }

  .blurred {
    filter: blur(2px);
    opacity: .5;
    z-index: 0;
  }

  canvas:not(.blurred) {
    z-index: 1;
  }

  .config-panel {
    position: absolute;
    left: 10px;
    top: 10px;
    background: rgba(0, 0, 0, 0.9);
    padding: 15px;
    border-radius: 8px;
    color: white;
    font-family: monospace;
    font-size: 12px;
    z-index: 1000;
  }

  .config-panel h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
  }

  .config-panel-grid {
    display: grid;
    grid-template-columns: auto auto;
    gap: 8px;
    align-items: center;
    width: 250px;
  }

  .config-panel-grid > *:not(button,label) {
    display: flex;
    justify-content: flex-start;
    width: 100px;
    padding: 4px;
    overflow: hidden;
  }

  .config-panel-grid label:has(input[type="checkbox"]) {
    width: 100%;
  }

  .control-button {
    position: absolute;
    right: 10px;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    font-family: monospace;
    font-size: 14px;
    border-radius: 4px;
    z-index: 1000;
    border: none;
  }

  .control-button.next {
    top: 10px;
  }

  .control-button.new {
    top: 60px;
  }

  .control-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .control-button:not(:disabled) {
    cursor: pointer;
  }

  .control-button:not(:disabled):hover {
    background-color: rgba(0, 0, 0, 0.9) !important;
  }

  .message-overlay {
    position: absolute;
    left: 300px;
    top: 10px;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    font-family: monospace;
    font-size: 14px;
    border-radius: 4px;
    z-index: 1000;
  }

  .visualize-rect {
    position: absolute;
    box-sizing: border-box;
    border-style: solid;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  #startNewTest {
    box-sizing: content-box;
    width: 100px;
    padding: 4px;
    border-radius: 4px;
    background: transparent;
    color: white;
  }
`;

async function visualize<C extends CentralizerClass>(
  input: TestInput,
  controllerConfig: ControllerConfig,
  CentralizerClass: C
) {
  const containerRect = Rect.fromDimension(input.viewWidth, input.viewHeight);
  const imageRect = Rect.fromDimension(input.imageWidth, input.imageHeight);
  const focusRect = input.focus;
  const config = input.config;

  const initialScale = input.initialScale || 1;
  const image = new Image(imageRect, focusRect);
  controllerConfig.imageSrc = image.imageSrc = input.imageSrc;
  const allowDistortion = input.allowDistortion || false;
  imageRect.scale(initialScale, initialScale, new Point(0, 0));
  const centralizer: Centralizer = new CentralizerClass(image, containerRect);
  const visualizer = createDebugVisualizer(domContext, controllerConfig);
  centralizer.transform(allowDistortion, config, visualizer);
}

function createDebugVisualizer<
  ContextRect,
  ContextMessage,
  C extends Controller
>(
  context: Context<ContextRect, ContextMessage, C>,
  controllerConfig: ControllerConfig
) {
  let prevRects: any = [];
  let prevMessage: any;

  const RECT_CONFIGS: any = [
    {
      renderTarget: "container",
      borderColor: "blue",
      borderWidth: 2,
      fill: `rgba(0,0,255,.3)`,
    },

    {
      renderTarget: "image",
      borderColor: "green",
      borderWidth: 2,
      fill: `rgba(0,255,0,.3)`,
      backgroundImage: controllerConfig.imageSrc,
    },

    {
      renderTarget: "focus",
      borderColor: "red",
      borderWidth: 2,
      fill: `rgba(255,0,0,.3)`,
    },
  ];

  // set background image for both container and image
  if (controllerConfig.imageSrc) {
    Object.assign(RECT_CONFIGS[0], {
      backgroundImage: controllerConfig.imageSrc,
    });
    Object.assign(RECT_CONFIGS[1], {
      backgroundImage: controllerConfig.imageSrc,
    });
    // if (controllerConfig.setContainerBackground) {
    //   Object.assign(RECT_CONFIGS[0], {
    //     backgroundImage: controllerConfig.imageSrc,
    //   });
    // } else {
    //   // image
    //   Object.assign(RECT_CONFIGS[1], {
    //     backgroundImage: controllerConfig.imageSrc,
    //   });
    // }
  }

  /**
   * A visualizer function that animate an image and show a message at last.
   *
   * @param image image for animation, if not exist, render it, otherwise animate it.
   * @endMessage message showing at the end of animation
   * @state current state when playing animation
   */
  return async (
    image: Image,
    endMessage: string = "",
    state: AnimationState = "playing"
  ) => {
    context.state = state;
    const {
      rect: imageRect,
      focus: focusRect,
      container: containerRect,
    } = image;

    // keep order in the array, must render container first
    const rects: Rect[] = [containerRect!, imageRect, focusRect];
    context.beforeAnimation();

    // render rectangles
    for (let i = 0; i < 3; i++) {
      const config = RECT_CONFIGS[i];
      const { renderTarget } = config;

      if (renderTarget === "container") {
        const calculatedProperties = image.getCSSBackgroundProperties()!;
        Object.assign(config, calculatedProperties);
        context.showDebugInfo(context.controller.output, calculatedProperties!);
      }

      if (!prevRects[i]) {
        prevRects[i] = await context.renderRect(rects[i], config);
      } else {
        prevRects[i] = await context.animateRect(
          prevRects[i],
          rects[i],
          config
        );
      }
    }

    const isAnimationStopped = !controllerConfig.autoPlay || state === "end";

    // render message
    if (!prevMessage) {
      prevMessage = await context.renderMessage(endMessage);
    } else {
      prevMessage = await context.animateMessage(prevMessage, endMessage!);
    }

    if (isAnimationStopped) {
      context.afterAnimation();
    }

    if (isAnimationStopped) {
      await context.maybeWaitingForInteraction(state);
    }
  };
}

type Color = "blue" | "green" | "red" | "black" | "white";
type TextAnimation = "transition";
type RenderRectConfig = {
  renderTarget?: "container" | "image" | "focus";

  borderWidth?: number;
  borderColor?: Color;
  fill?: Color;

  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
};

abstract class Context<ContextRect, ContextMessage, C extends Controller> {
  state: AnimationState;
  controller!: C;

  constructor() {
    this.state = "initializing";
  }

  abstract beforeAnimation(): void;
  abstract afterAnimation(): void;

  abstract onContextReady(fn?: Function): Promise<void>;
  abstract maybeWaitingForInteraction(state: AnimationState): Promise<void>;
  abstract clear(): Promise<void>;
  abstract renderRect(
    rect: Rect,
    config?: RenderRectConfig
  ): Promise<ContextRect>;

  abstract animateRect(
    from: ContextRect,
    to: Rect,
    config?: RenderRectConfig
  ): Promise<ContextRect>;
  abstract renderMessage(message: string): Promise<ContextMessage>;

  // show user friendly status info with animation
  abstract animateMessage(
    from: ContextMessage,
    to: string,
    animation?: TextAnimation
  ): Promise<ContextMessage>;

  // show debug info
  abstract showDebugInfo(
    host: typeof this.controller.output,
    info: Record<string, string>
  ): Promise<void>;
}

type AnimationState = "initializing" | "initialized" | "playing" | "end";

abstract class Controller {
  context: any;
  constructor(context: any) {
    this.context = context;
  }
  abstract getConfig(): [TestInput, ControllerConfig];
  output: any;
  config: any;
}

type DOMControllerConfig = {
  autoPlay: boolean;
  imageSrc?: string;
};

// config that are not used by algorithm, but useful for visualization
type ControllerConfig = DOMControllerConfig;

type DOMControllerOutput = {
  computedBackgroundPosition: HTMLSpanElement;
  computedBackgroundSize: HTMLSpanElement;
};

class DOMController extends Controller {
  nextButton: HTMLButtonElement;
  newButton: HTMLButtonElement;
  onStart?: Function;
  private configPanel: HTMLDivElement;
  private renderedElements: HTMLElement[] = [];
  private configElements: HTMLElement[] = [];
  private inputs: {
    viewWidth: HTMLInputElement;
    viewHeight: HTMLInputElement;
    imageWidth: HTMLInputElement;
    imageHeight: HTMLInputElement;
    padding: HTMLInputElement;
    focusAreaTopLeftX: HTMLInputElement;
    focusAreaTopLeftY: HTMLInputElement;
    focusAreaBottomRightX: HTMLInputElement;
    focusAreaBottomRightY: HTMLInputElement;
    allowDistortion: HTMLInputElement;
    autoPlay: HTMLInputElement;
    imageSrc: HTMLInputElement;
  };

  output: DOMControllerOutput;

  constructor(context: DOMContext) {
    super(context);

    // Create config panel from HTML string
    const panel = document.createElement("div");
    panel.innerHTML = `
      <div class="config-panel">
        <h3>Config</h3>
        <div class="config-panel-grid">
          <label>View Width:</label>
          <input type="number" id="viewWidth" value="600">

          <label>View Height:</label>
          <input type="number" id="viewHeight" value="600">

          <label>Image Width:</label>
          <input type="number" id="imageWidth" value="900">

          <label>Image Height:</label>
          <input type="number" id="imageHeight" value="512">

          <label>Padding:</label>
          <input type="number" id="padding" value="20">

          <label>Focus TL X:</label>
          <input type="number" id="focusAreaTopLeftX" value="0">

          <label>Focus TL Y:</label>
          <input type="number" id="focusAreaTopLeftY" value="64">

          <label>Focus BR X:</label>
          <input type="number" id="focusAreaBottomRightX" value="448">

          <label>Focus BR Y:</label>
          <input type="number" id="focusAreaBottomRightY" value="448">

          <label>Allow Distortion:</label>
          <div><label><input type="checkbox" id="allowDistortion"></label></div>

          <label>Auto Play:</label>
          <div><label><input type="checkbox" id="autoPlay" checked></label></div>

          <label>Background image:</label>
          <div><label><input type="file" id="imageSrc"></label></div>

          <label>Draw:</label>
          <div><label><select id="drawRectangleOf" value="focus"><option value="focus">Image Focus</option><option value="container">Container</option></select></label></div>

          <label>Auto update view:</label>
          <div><label><input type="checkbox" id="autoUpdateImageDimension" checked></label></div>

          <label>Update container background:</label>
          <input type="range" id="containerOpacity" min="0" max="1" step="0.01" value="1">

          <label>Toggle container background:</label>
          <div><label><input type="checkbox" id="toggleImageBackground" checked></label></div>

          <label>Background position:</label>
          <span id="computedBackgroundPosition"></span>

          <label>Background size:</label>
          <span id="computedBackgroundSize"></span>

          <label></label>
          <button id="startNewTest">Start New Test</button>
        </div>
        <style id="toggleContainerBackgroundStyle">
          #visualize-rect-image {
            opacity:0;
          }
        </style>
      </div>
    `;
    this.configPanel = panel.firstElementChild as HTMLDivElement;

    // Store references to inputs
    this.inputs = {
      viewWidth: this.configPanel.querySelector("#viewWidth")!,
      viewHeight: this.configPanel.querySelector("#viewHeight")!,
      imageWidth: this.configPanel.querySelector("#imageWidth")!,
      imageHeight: this.configPanel.querySelector("#imageHeight")!,
      padding: this.configPanel.querySelector("#padding")!,
      focusAreaTopLeftX: this.configPanel.querySelector("#focusAreaTopLeftX")!,
      focusAreaTopLeftY: this.configPanel.querySelector("#focusAreaTopLeftY")!,
      focusAreaBottomRightX: this.configPanel.querySelector(
        "#focusAreaBottomRightX"
      )!,
      focusAreaBottomRightY: this.configPanel.querySelector(
        "#focusAreaBottomRightY"
      )!,
      allowDistortion: this.configPanel.querySelector("#allowDistortion")!,
      autoPlay: this.configPanel.querySelector("#autoPlay")!,
      imageSrc: this.configPanel.querySelector("#imageSrc")!,
    };

    this.output = {
      computedBackgroundPosition: this.configPanel.querySelector(
        "#computedBackgroundPosition"
      )!,
      computedBackgroundSize: this.configPanel.querySelector(
        "#computedBackgroundSize"
      )!,
    };

    // Add config panel first
    document.body.appendChild(this.configPanel);
    this.nextButton = document.createElement("button");
    this.nextButton.className = "control-button next";
    document.body.appendChild(this.nextButton);
    this.newButton = document.querySelector(
      "#startNewTest"
    ) as HTMLButtonElement;
    this.newButton.addEventListener("click", () => {
      this.init();
      this.start();
    });

    // Auto-update image dimensions when file is selected
    const autoUpdateCheckbox = this.configPanel.querySelector(
      "#autoUpdateImageDimension"
    ) as HTMLInputElement;
    this.inputs.imageSrc.addEventListener("change", () => {
      const file = this.inputs.imageSrc.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        const img = new window.Image();
        img.onload = () => {
          // Auto-update dimension inputs if checkbox is checked
          if (autoUpdateCheckbox.checked) {
            this.inputs.imageWidth.value = String(img.naturalWidth);
            this.inputs.imageHeight.value = String(img.naturalHeight);
          }

          const canvas =
            (document.querySelector("#imageCanvas") as HTMLCanvasElement) ??
            document.createElement("canvas");
          const previousUrl = canvas.getAttribute("data-url");
          if (previousUrl) {
            URL.revokeObjectURL(previousUrl);
          }
          canvas.id = "imageCanvas";
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.style.position = "absolute";
          canvas.style.left = `${(window.innerWidth - img.naturalWidth) / 2}px`;
          canvas.style.top = `${
            (window.innerHeight - img.naturalHeight) / 2
          }px`;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }

          new CanvasHelper(canvas, url).withRectangleDraw(
            (topLeftX, topLeftY, bottomRightX, bottomRightY) => {
              this.inputs.focusAreaTopLeftX.value = String(
                Math.round(topLeftX)
              );
              this.inputs.focusAreaTopLeftY.value = String(
                Math.round(topLeftY)
              );
              this.inputs.focusAreaBottomRightX.value = String(
                Math.round(bottomRightX)
              );
              this.inputs.focusAreaBottomRightY.value = String(
                Math.round(bottomRightY)
              );
            }
          );

          document.body.appendChild(canvas);
          canvas.setAttribute("data-url", url);
          this.configElements.push(canvas);
        };
        img.src = url;
      }
    });

    // Handle #drawRectangleOf select changes
    const drawRectangleOfSelect = this.configPanel.querySelector(
      "#drawRectangleOf"
    ) as HTMLSelectElement;
    let containerCanvas: HTMLCanvasElement | null = null;
    let drawingCanvas: HTMLCanvasElement | null = null;

    drawRectangleOfSelect.addEventListener("change", () => {
      const mode = drawRectangleOfSelect.value;

      drawingCanvas = document.querySelector("#containerCanvas,#imageCanvas");

      if (mode === "container") {
        // Create container canvas if not exists
        if (!containerCanvas) {
          containerCanvas = document.createElement("canvas");
          containerCanvas.id = "containerCanvas";
          containerCanvas.width = window.innerWidth;
          containerCanvas.height = window.innerHeight;
          containerCanvas.style.position = "absolute";
          containerCanvas.style.left = "0";
          containerCanvas.style.top = "0";
          document.body.appendChild(containerCanvas);
          this.configElements.push(containerCanvas);

          // Setup rectangle drawing for container
          const viewWidth = parseInt(this.inputs.viewWidth.value);
          const viewHeight = parseInt(this.inputs.viewHeight.value);
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;

          new CanvasHelper(containerCanvas).withRectangleDraw(
            (topLeftX, topLeftY, bottomRightX, bottomRightY) => {
              this.inputs.viewWidth.value = String(
                Math.round(bottomRightX - topLeftX)
              );
              this.inputs.viewHeight.value = String(
                Math.round(bottomRightY - topLeftY)
              );
            },
            {
              topLeftX: centerX - viewWidth / 2,
              topLeftY: centerY - viewHeight / 2,
              bottomRightX: centerX + viewWidth / 2,
              bottomRightY: centerY + viewHeight / 2,
            },
            { borderColor: "black" }
          );
        }

        // Blur image canvas, unblur container canvas
        if (drawingCanvas) {
          drawingCanvas.classList.add("blurred");
        }
        if (containerCanvas) {
          containerCanvas.classList.remove("blurred");
        }
      } else {
        // mode === 'focus'
        // Blur container canvas, unblur image canvas
        if (containerCanvas) {
          containerCanvas.classList.add("blurred");
        }
        if (drawingCanvas) {
          drawingCanvas.classList.remove("blurred");
        }
      }
    });

    // Trigger initial state
    drawRectangleOfSelect.dispatchEvent(new Event("change"));

    const toggleImageBackground = document.querySelector(
      "#toggleImageBackground"
    ) as HTMLInputElement;
    const sheet = document.getElementById(
      "toggleContainerBackgroundStyle"
    ) as any;
    sheet.disabled = true;
    toggleImageBackground.addEventListener("change", () => {
      sheet.disabled = !sheet.disabled;
    });

    let currentContainer: HTMLElement | undefined;
    this.configPanel
      .querySelector("#containerOpacity")
      ?.addEventListener("input", (e: Event) => {
        if (
          currentContainer &&
          this.context.renderedElements.includes(currentContainer)
        ) {
          currentContainer.style.opacity = `${
            (e.target as HTMLInputElement)?.value
          }`;
        } else {
          currentContainer = document.querySelector(
            "#visualize-rect-container"
          ) as HTMLElement;
        }
      });
  }

  clearRenderedElements() {
    this.renderedElements.forEach((el) => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    this.renderedElements = [];
  }

  getConfig(): [TestInput, ControllerConfig] {
    return [
      {
        imageSrc: this.inputs.imageSrc.files?.[0]
          ? URL.createObjectURL(this.inputs.imageSrc.files[0])
          : undefined,
        viewWidth: parseInt(this.inputs.viewWidth.value),
        viewHeight: parseInt(this.inputs.viewHeight.value),
        imageWidth: parseInt(this.inputs.imageWidth.value),
        imageHeight: parseInt(this.inputs.imageHeight.value),
        focus: Rect.fromCornerPosition(
          parseInt(this.inputs.focusAreaTopLeftX.value),
          parseInt(this.inputs.focusAreaTopLeftY.value),
          parseInt(this.inputs.focusAreaBottomRightX.value),
          parseInt(this.inputs.focusAreaBottomRightY.value)
        ),
        allowDistortion: this.inputs.allowDistortion.checked,
        config: { padding: parseInt(this.inputs.padding.value) },
      },
      {
        autoPlay: this.inputs.autoPlay.checked,
      },
    ];
  }

  start() {
    this.hideControllerElements();
    this.onStart?.apply(this);
  }

  init() {
    // remove ongoing listener
    if (this.nextButton) {
      this.nextButton.outerHTML = this.nextButton.outerHTML;
      this.nextButton = document.querySelector(
        ".control-button.next"
      ) as HTMLButtonElement;
    }

    this.context.clear();
    this.setNextMessage("Start");
    this.setDisabled(true);
    this.showControllerElements();
  }

  hideControllerElements() {
    this.configElements.forEach((el) => {
      el.classList.add("hidden");
    });
  }

  showControllerElements() {
    this.configElements.forEach((el) => {
      el.classList.remove("hidden");
    });
  }

  onNext(fn: any) {
    this.nextButton.addEventListener("click", fn, { once: true });
  }
  setDisabled(disabled: boolean) {
    this.nextButton.disabled = disabled;
  }
  setNextMessage(message: string) {
    this.nextButton.textContent = message;
  }
}

class DOMContext extends Context<
  HTMLDivElement,
  HTMLSpanElement,
  DOMController
> {
  private shiftX: number = 0;
  private shiftY: number = 0;
  private renderedElements: HTMLElement[] = [];
  private animationDuration: number;

  constructor({ animationDuration = 500 }) {
    super();
    this.controller = new DOMController(this);
    this.animationDuration = animationDuration;
  }

  afterAnimation() {
    this.controller.setDisabled(false);
  }

  beforeAnimation() {
    this.controller.setDisabled(true);
  }

  async onContextReady(fn?: Function) {
    // Inject centralized CSS styles
    const style = document.createElement("style");
    style.textContent = VISUALIZE_STYLES;
    document.head.appendChild(style);

    this.controller.onStart = fn?.bind(this, this.controller);

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.controller.init();
      });
    } else {
      this.controller.init();
    }
  }

  async clear() {
    // Remove all rendered elements from the DOM
    this.renderedElements.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    // Clear the array
    this.renderedElements = [];
  }

  async maybeWaitingForInteraction(currentState: AnimationState) {
    if (currentState !== "end") {
      await new Promise<void>((resolve) => {
        this.controller.onNext(() => {
          this.controller.setNextMessage("Next");
          resolve();
        });
      });
    } else {
      this.controller.setNextMessage("Restart");
      this.controller.onNext(() => {
        this.controller.start();
      });
    }
  }

  async renderRect(
    rect: Rect,
    config: RenderRectConfig = {
      borderWidth: 2,
      borderColor: "black",
      fill: "white",
    }
  ) {
    // Calculate shift to center container in window (only once for container)
    // And this is why we need to render container first
    if (config.renderTarget === "container") {
      const windowCenterX = window.innerWidth / 2;
      const windowCenterY = window.innerHeight / 2;
      const containerCenterX = rect.center.x;
      const containerCenterY = rect.center.y;
      this.shiftX = windowCenterX - containerCenterX;
      this.shiftY = windowCenterY - containerCenterY;
    }

    // Apply shift to position
    const left = rect.tl.x + this.shiftX;
    const top = rect.tl.y + this.shiftY;

    const el = document.createElement("div");
    el.className = "visualize-rect";
    el.id = `visualize-rect-${config.renderTarget}`;
    // Dynamic styles that can't be in CSS
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.width = `${rect.width}px`;
    el.style.height = `${rect.height}px`;
    el.style.borderWidth = `${config.borderWidth || 2}px`;
    // Set transition: all properties use delay except opacity (0s delay)
    const delay = this.animationDuration / 1000;
    el.style.transition = `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s, opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0s`;

    if (
      config.backgroundImage &&
      config.backgroundPosition &&
      config.backgroundSize
    ) {
      el.style.backgroundImage = `url(${config.backgroundImage})`;
      el.style.backgroundPosition = config.backgroundPosition;
      el.style.backgroundSize = config.backgroundSize;
    } else {
      el.style.borderColor = config.borderColor || "black";
      el.style.backgroundColor = config.fill || "transparent";
    }

    document.body.appendChild(el);

    // Track element for cleanup
    this.renderedElements.push(el);

    return el;
  }

  async animateRect(
    from: HTMLDivElement,
    to: Rect,
    config: RenderRectConfig = {
      borderWidth: 2,
      borderColor: "black",
      fill: "white",
    }
  ) {
    // Animate the existing element to the new position and size using CSS transitions
    return new Promise<HTMLDivElement>((resolve) => {
      // Apply shift to position
      const left = to.tl.x + this.shiftX;
      const top = to.tl.y + this.shiftY;

      // Update properties - browser will animate the changes (transition is defined in CSS)
      from.style.left = `${left}px`;
      from.style.top = `${top}px`;
      from.style.width = `${to.width}px`;
      from.style.height = `${to.height}px`;
      from.style.borderWidth = `${config.borderWidth || 2}px`;
      from.style.borderColor = config.borderColor || "black";

      if (config.backgroundPosition && config.backgroundSize) {
        from.style.backgroundPosition = config.backgroundPosition;
        from.style.backgroundSize = config.backgroundSize;
      }

      // Resolve after animation completes
      setTimeout(() => resolve(from), this.animationDuration);
    });
  }

  async renderMessage(message: string) {
    const el = document.createElement("span");
    el.textContent = message;
    el.className = "message-overlay";
    document.body.appendChild(el);

    // Track element for cleanup
    this.renderedElements.push(el);

    return el;
  }

  async animateMessage(
    from: HTMLSpanElement,
    to: string,
    animation = "transition" as TextAnimation
  ) {
    return new Promise<HTMLSpanElement>((resolve) => {
      // Fade out using CSS transition
      from.style.transition = "opacity 0.2s ease-in-out";
      from.style.opacity = "0";

      setTimeout(() => {
        // Update text content
        from.textContent = to;
        // Fade back in
        from.style.opacity = "1";
        // Image animation duration is constant, I dont think there is any value setting this
        setTimeout(() => resolve(from), 200);
      }, 200);
    });
  }

  async showDebugInfo(host: DOMControllerOutput, info: Record<string, string>) {
    host.computedBackgroundPosition.textContent = info.backgroundPosition;
    host.computedBackgroundSize.textContent = info.backgroundSize;
  }
}

const domContext = new DOMContext({});

async function main(DOMController: DOMController) {
  const [input, config] = DOMController.getConfig();
  await visualize(input, config, TouchAndRecenterCentralizer);
}

domContext.onContextReady(main);
