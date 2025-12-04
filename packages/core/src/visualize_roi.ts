import { pipeline } from "@huggingface/transformers";

// State
let detector: any = null;
let currentImageUrl: string | null = null;
let originalImage: ImageData | null = null;

// DOM
const imageInput = document.getElementById("imageInput") as HTMLInputElement;
const queryInput = document.getElementById("queryInput") as HTMLInputElement;
const threshold = document.getElementById("threshold") as HTMLInputElement;
const detectBtn = document.getElementById("detectBtn") as HTMLButtonElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const placeholder = document.getElementById("placeholder")!;
const statusDot = document.getElementById("statusDot")!;
const statusText = document.getElementById("statusText")!;
const progressBar = document.getElementById("progressBar") as HTMLElement;
const resultsPanel = document.getElementById("resultsPanel")!;
const resultsList = document.getElementById("resultsList")!;

// Colors for bounding boxes
const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#06b6d4",
];

function setStatus(status: string, text: string, progress: number | null = null) {
  statusDot.className = "status-dot " + status;
  statusText.textContent = text;
  if (progress !== null) {
    progressBar.style.width = progress + "%";
  }
}

// Load model
async function loadModel() {
  try {
    setStatus(
      "loading",
      "Loading OWL-ViT model (first time may take a minute)...",
      10
    );

    detector = await pipeline(
      "zero-shot-object-detection",
      "Xenova/owlvit-base-patch32",
      {
        progress_callback: (progress: any) => {
          if (progress.status === "downloading") {
            const pct = Math.round((progress.loaded / progress.total) * 90);
            setStatus("loading", `Downloading: ${progress.file}`, pct);
          }
        },
      }
    );

    setStatus(
      "ready",
      "Model ready! Upload an image and enter objects to detect.",
      100
    );
    detectBtn.disabled = false;
  } catch (error: any) {
    console.error("Model loading error:", error);
    setStatus("error", "Error loading model: " + error.message, 0);
  }
}

// Handle image upload
imageInput.addEventListener("change", (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  currentImageUrl = URL.createObjectURL(file);

  const img = new Image();
  img.onload = () => {
    // Scale to fit
    const maxDim = 800;
    let width = img.width;
    let height = img.height;

    if (width > maxDim || height > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    originalImage = ctx.getImageData(0, 0, width, height);
    placeholder.style.display = "none";
    resultsPanel.style.display = "none";
  };
  img.src = currentImageUrl;
});

// Preset buttons
document.querySelectorAll(".preset-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const dataset = (btn as HTMLElement).dataset;
    queryInput.value = dataset.query || "";
  });
});

// Run detection
detectBtn.addEventListener("click", async () => {
  if (!currentImageUrl || !queryInput.value.trim()) {
    alert("Please upload an image and enter objects to detect");
    return;
  }

  const queries = queryInput.value
    .split(",")
    .map((q) => q.trim())
    .filter((q) => q);
  if (queries.length === 0) {
    alert("Please enter at least one object to detect");
    return;
  }

  setStatus("loading", "Running detection...", 50);
  detectBtn.disabled = true;

  try {
    const results = await detector(currentImageUrl, queries, {
      threshold: parseFloat(threshold.value),
      percentage: true,
    });

    // Restore original image
    ctx.putImageData(originalImage!, 0, 0);

    // Draw results
    resultsList.innerHTML = "";

    if (results.length === 0) {
      resultsPanel.style.display = "block";
      resultsList.innerHTML =
        '<div class="result-item"><span style="color: #888">No objects detected. Try lowering the threshold or different query terms.</span></div>';
    } else {
      resultsPanel.style.display = "block";

      results.forEach((result: any, i: number) => {
        const color = COLORS[i % COLORS.length];
        const { box, label, score } = result;

        // Convert percentage to pixels
        const x = box.xmin * canvas.width;
        const y = box.ymin * canvas.height;
        const w = (box.xmax - box.xmin) * canvas.width;
        const h = (box.ymax - box.ymin) * canvas.height;

        // Draw box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        // Draw label background
        ctx.font = "bold 14px sans-serif";
        const text = `${label} ${(score * 100).toFixed(0)}%`;
        const textWidth = ctx.measureText(text).width;

        ctx.fillStyle = color;
        ctx.fillRect(x, y - 22, textWidth + 8, 22);

        // Draw label text
        ctx.fillStyle = "#fff";
        ctx.fillText(text, x + 4, y - 6);

        // Add to results list
        const item = document.createElement("div");
        item.className = "result-item";
        item.innerHTML = `
              <div class="result-color" style="background: ${color}"></div>
              <span class="result-label">${label}</span>
              <span class="result-score">${(score * 100).toFixed(1)}%</span>
              <span class="result-bbox">[${Math.round(x)}, ${Math.round(
          y
        )}, ${Math.round(w)}, ${Math.round(h)}]</span>
            `;
        resultsList.appendChild(item);
      });
    }

    setStatus("ready", `Found ${results.length} object(s)`, 100);
  } catch (error: any) {
    console.error("Detection error:", error);
    setStatus("error", "Error: " + error.message, 0);
  }

  detectBtn.disabled = false;
});

// Allow Enter key to trigger detection
queryInput.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter" && !detectBtn.disabled) {
    detectBtn.click();
  }
});

// Start loading
loadModel();
