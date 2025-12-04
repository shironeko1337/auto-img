# Visualizer Usage Guide

The visualizer helps you see how the image auto-centering algorithm works by animating the transformations in real-time.

## Quick Start

### Option 1: Build and open (Recommended)

```bash
npm run visualize
```

This will:
1. Bundle `visualize.ts` using esbuild
2. Open `visualizer.html` in your default browser
3. Animations use native CSS transitions (no external dependencies)

### Option 2: Build only

```bash
npm run visualize:build
```

Then manually open `visualizer.html` in your browser.

## How it Works

### DOMContext Implementation

The `DOMContext` class implements the `Context` interface with the following methods:

#### `onContextReady(fn?: Function)`
Waits for DOM to be ready, then executes the callback function.

#### `renderRect(rect: Rect, config?: RenderRectConfig)`
Creates and returns a `div` element with:
- **Position**: Absolute positioning based on `rect.tl.x`, `rect.tl.y`
- **Size**: Width and height from `rect.width`, `rect.height`
- **Border**: Width and color from `config.borderWidth`, `config.borderColor`
- **Fill**: Background color from `config.fill`

#### `animateRect(from: HTMLDivElement, to: Rect, config?: RenderRectConfig)`
Animates an existing div from its current position to the target position:
- Uses **CSS transitions** for smooth animations (0.5s duration, cubic-bezier easing)
- Animates position, size, border, and background color

#### `renderMessage(message: string)`
Creates and returns a `span` element displaying the message:
- Fixed position in top-left corner
- Dark background with white text
- Monospace font for readability

#### `animateMessage(from: HTMLSpanElement, to: string, animation?: TextAnimation)`
Animates text change with fade effect:
- Fades out current text (0.2s)
- Updates content
- Fades in new text (0.2s)
- Uses CSS transitions

## Animation Approach

The visualizer uses **native CSS transitions** for all animations:
- No external dependencies required
- Smooth easing with `cubic-bezier(0.4, 0, 0.2, 1)` (similar to ease-in-out)
- Lightweight and fast
- Works in all modern browsers

## Customization

You can modify the animation behavior in `src/visualize.ts`:

```typescript
// Edit the visualize function to change test inputs
await visualize(
  {
    viewWidth: 600,
    viewHeight: 600,
    imageWidth: 512,
    imageHeight: 512,
    focusArea: Rect.fromCornerPosition(64, 64, 448, 448),
    config: { padding: 5 },
  },
  TouchAndRecenterCentralizer
);
```

## Visualization Details

The visualizer shows three colored rectangles:
- **Blue**: Container rectangle
- **Green**: Image rectangle
- **Red**: Focus area rectangle

As the centralizer algorithm runs, you'll see these rectangles animate to show how the image is being transformed to center the focus area within the container.
