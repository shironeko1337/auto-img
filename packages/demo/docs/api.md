# API

There two main APIs: the AutoImgAPI singleton for managing image rendering, and the AutoImgElement custom element for direct element manipulation.

It is suggested to use custom elements:
- Defer loading and placeholder only work on custom elements.
- `width` and `height` are defined as a property for the image container size of custom elements.
For native elements, container width and height should be defined separately as
part of the element styles. This library only retrieves image container size before positioning.

If you only want core API to auto position background of native elements, you can just import AutoImgAPI.

---

## 1. AutoImgAPI Singleton

The `autoImgAPI` is a singleton instance that manages AutoImg models and provides high-level APIs for loading and rendering images.

### Import

```javascript
import { autoImgAPI } from 'autoimg-core/api';
// Or access globally
window.AutoImgAPI
```

### Configuration

The API instance has a `config` property that can be modified:

```javascript
autoImgAPI.config = {
  imageServer: string,           // Optional: Server for fetching image data
  resizeRerender: boolean,       // Default: true - Re-render on resize
  placeholder: string | object,  // Default placeholder image
  resizeThrottle: number,        // Default: 300ms - Throttle interval
  loadImageTimeout: number,      // Default: 10000ms - Image load timeout
  defer: boolean                 // Default: false - Defer initial rendering
};
```

### Methods

```typescript
loadAll(selector?: string): void
```

Scans the document and loads all matching elements.

**Parameters:**
- `selector` (optional): CSS selector string. Default: `"[data-auto-img]"`

**Usage:**
```javascript
// Load all elements with data-auto-img attribute
autoImgAPI.loadAll();

// Load specific elements
autoImgAPI.loadAll('.my-images');
```

**Notes:**
- Attaches a model to each element
- Automatically reads attributes and renders (unless deferred)
- If DOM is still loading, waits for `DOMContentLoaded`

---

```typescript
load(element: HTMLElement): void
```

Loads a single HTML element by attaching a model to it.

**Parameters:**
- `element`: HTML DOM element reference

**Usage:**
```javascript
const imgElement = document.querySelector('#my-img');
autoImgAPI.load(imgElement);
```

**Notes:**
- Creates and attaches an `AutoImgModel` to the element
- Reads attributes from the element
- Triggers `loadAndRender()` if attributes are valid

---

```typescript
renderAll(selector?: string): void
```

Triggers rendering for all matching elements.

**Parameters:**
- `selector` (optional): CSS selector string. Default: `"[data-auto-img]"`

**Usage:**
```javascript
// Re-render all auto-img elements
autoImgAPI.renderAll();

// Re-render specific elements
autoImgAPI.renderAll('.needs-update');
```

**Notes:**
- Does not wait for rendering to complete
- Useful for triggering updates after layout changes

---

```typescript
render(element: HTMLElement, waitResize?: boolean): Promise<void>
```

Manually renders a specific element.

**Parameters:**
- `element`: HTML DOM element reference
- `waitResize` (optional): Whether to wait for size to stabilize. Default: `false`

**Returns:** Promise that resolves when rendering completes

**Usage:**
```javascript
const imgElement = document.querySelector('#my-img');

// Render immediately
await autoImgAPI.render(imgElement);

// Wait for container size to stabilize before rendering
await autoImgAPI.render(imgElement, true);
```

**Use Cases:**

1. **waitResize: true** - Element is resizing and you want to render at a specific moment:
   ```javascript
   await autoImgAPI.render(element, true);
   ```

2. **waitResize: false** - New image source is set and container is stable:
   ```javascript
   element.setAttribute('data-auto-img-src', 'new-image.jpg');
   await autoImgAPI.render(element);
   ```

---

## 2. AutoImgElement Custom Element

The `<auto-img>` custom element provides direct methods for controlling image loading and positioning.

### Access

```javascript
// Get element reference
const autoImg = document.querySelector('auto-img');

// Access methods on the element
autoImg.isImageLoaded('image.jpg');
```

### Properties

#### `model?: AutoImgModel`

Reference to the attached `AutoImgModel` instance. Available after the element is connected to the DOM.

```javascript
const autoImg = document.querySelector('auto-img');
console.log(autoImg.model); // AutoImgModel instance
```

---

### Methods

```typescript
isImageLoaded(src?: string): boolean
```

Checks if an image is loaded.

**Parameters:**
- `src` (optional): Image source URL to check

**Returns:** `true` if image is loaded, `false` otherwise

**Usage:**
```javascript
const autoImg = document.querySelector('auto-img');

// Check if current image is loaded
if (autoImg.isImageLoaded()) {
  console.log('Image is loaded');
}

// Check if specific image is loaded
if (autoImg.isImageLoaded('https://example.com/image.jpg')) {
  console.log('Specific image is loaded');
}
```

**Notes:**
- If image is loading, checks the loading image's state
- Otherwise, checks if the displayed image source matches the given source

---

```typescript
showLoadedImage(): void
```

Displays the loaded image by replacing the current image with the loading image.

**Usage:**
```javascript
const autoImg = document.querySelector('auto-img');
autoImg.showLoadedImage();
```

**Notes:**
- Only has effect if there's a loading image ready
- Automatically called internally after image loads
- Removes the old image and displays the new one

---

```typescript
loadImage(src: string, timeout: number): Promise<PixelSize>
```

Starts loading an image with timeout.

**Parameters:**
- `src`: Image source URL
- `timeout`: Maximum time to wait for image load (milliseconds)

**Returns:** Promise resolving to `{ width: number, height: number }`

**Usage:**
```javascript
const autoImg = document.querySelector('auto-img');

try {
  const size = await autoImg.loadImage('https://example.com/image.jpg', 5000);
  console.log(`Image loaded: ${size.width}x${size.height}`);
} catch (error) {
  console.error('Failed to load image:', error);
}
```

**Notes:**
- Returns immediately if image is already loaded
- Creates a hidden loading image during load
- Times out after specified duration, resolving to `{ width: 0, height: 0 }`
- Rejects promise on image load error

---

```typescript
setPosition(position: ImagePosition): void
```

Sets the position of the image within the container.

**Parameters:**
- `position`: Object with `backgroundSize` and `backgroundPosition` properties
  ```typescript
  {
    backgroundSize: string,    // e.g., "120% 120%"
    backgroundPosition: string // e.g., "10% 20%"
  }
  ```

**Usage:**
```javascript
const autoImg = document.querySelector('auto-img');

autoImg.setPosition({
  backgroundSize: '150% 150%',
  backgroundPosition: '25% 50%'
});
```

**Notes:**
- Equivalent to CSS `background-size` and `background-position`
- Applied to the inner `<img>` element in shadow DOM
- Automatically calculates transform for proper positioning

---

```typescript
setPositionForPlaceholder(): void
```

Sets position for placeholder image (centered, no stretching).

**Usage:**
```javascript
const autoImg = document.querySelector('auto-img');
autoImg.setPositionForPlaceholder();
```

**Notes:**
- Centers placeholder without distortion
- Uses `object-fit: none` to prevent stretching
- Typically called internally when showing placeholder

---

## Examples

### Complete Workflow Example

```javascript
// 1. Load all images with data-auto-img attribute
autoImgAPI.loadAll('[data-auto-img]');

// 2. Get reference to a specific auto-img element
const autoImg = document.querySelector('#hero-image');

// 3. Check if image is loaded
if (!autoImg.isImageLoaded()) {
  // 4. Load image with timeout
  const size = await autoImg.loadImage(
    'https://example.com/hero.jpg',
    10000
  );

  // 5. Show the loaded image
  autoImg.showLoadedImage();
}

// 6. Manually trigger re-render after layout change
await autoImgAPI.render(autoImg, true);
```

### Deferred Loading Example

```html
<auto-img
  id="deferred-img"
  src="image.jpg"
  defer
  focus="100,200;300,400">
</auto-img>
```

```javascript
// Load when ready (e.g., when user scrolls to element)
const img = document.querySelector('#deferred-img');
await autoImgAPI.render(img);
```

### Dynamic Image Update Example

```javascript
const autoImg = document.querySelector('auto-img');

// Update src attribute
autoImg.setAttribute('src', 'new-image.jpg');

// Trigger re-render
await autoImgAPI.render(autoImg);
```
