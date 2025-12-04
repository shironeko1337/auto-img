# AutoImg Web Component Library - Usage Guide

This guide explains how to use the `autoimg-webcomponent` library in your projects.

## Installation

### As an NPM Package (for bundled projects)

```bash
npm install autoimg-webcomponent
```

Then import in your JavaScript/TypeScript:

```javascript
import 'autoimg-webcomponent';
import { AutoImg } from 'autoimg-webcomponent';

// Now you can use <auto-img> elements in your HTML
// and control them with the AutoImg API
```

### As a Standalone Script (for HTML pages)

Download the `index.global.js` file from the `dist` folder and include it in your HTML:

```html
<script src="path/to/index.global.js"></script>
```

The `AutoImg` global variable will be automatically available.

## Usage

### Basic HTML Usage

#### 1. Fixed Size Image

```html
<auto-img
  src="https://example.com/image.jpg"
  width="400px"
  height="300px"
></auto-img>
```

#### 2. Fill Parent Container

```html
<div style="width: 100%; height: 500px;">
  <auto-img src="https://example.com/image.jpg"></auto-img>
</div>
```

The image will automatically fill the parent container (default width and height are `100%`).

#### 3. With Placeholder

```html
<auto-img
  src="https://example.com/image.jpg"
  placeholder="https://example.com/loading.jpg"
  width="400px"
  height="300px"
></auto-img>
```

#### 4. With Focus Area

Specify the area of the image that should remain visible when cropping:

```html
<!-- Format: "topLeft.x,topLeft.y;bottomRight.x,bottomRight.y" -->
<auto-img
  src="https://example.com/image.jpg"
  focus="100,200;600,500"
  width="400px"
  height="300px"
></auto-img>
```

Or use separate attributes:

```html
<auto-img
  src="https://example.com/image.jpg"
  focus.tl="100,200"
  focus.br="600,500"
  width="400px"
  height="300px"
></auto-img>
```

You can also use expanded aliases for better readability:

```html
<!-- Without hyphens -->
<auto-img
  src="https://example.com/image.jpg"
  focus.topleft="100,200"
  focus.bottomright="600,500"
></auto-img>

<!-- With hyphens -->
<auto-img
  src="https://example.com/image.jpg"
  focus.top-left="100,200"
  focus.bottom-right="600,500"
></auto-img>
```

#### 5. With Padding

Add minimum padding around the focus area:

```html
<auto-img
  src="https://example.com/image.jpg"
  focus="100,200;600,500"
  padding="20px"
  width="400px"
  height="300px"
></auto-img>
```

#### 6. Allow Distortion

By default, images maintain aspect ratio. Use `allow-distortion` to allow stretching:

```html
<auto-img
  src="https://example.com/image.jpg"
  width="400px"
  height="200px"
  allow-distortion
></auto-img>
```

#### 7. Deferred Rendering

Images with the `defer` attribute won't render automatically:

```html
<auto-img
  defer
  id="my-image"
  src="https://example.com/image.jpg"
  width="400px"
  height="300px"
></auto-img>

<script>
  // Render manually when needed
  AutoImg.render('#my-image');
</script>
```

### JavaScript API

#### Initialize with Global Config

```javascript
AutoImg.init({
  imageServer: 'https://my-image-server.com',
  resizeRerender: true,
  showPlaceholderWhenResizing: false,
  placeholder: {
    'big': 'https://example.com/big-placeholder.png',
    'small': 'https://example.com/small-placeholder.png',
  },
  resizeThrottle: 300
});
```

#### Configuration Options

- **imageServer** (string, optional): Server URL for fetching pre-calculated image data
- **resizeRerender** (boolean, default: `true`): Whether to re-render images on window resize
- **showPlaceholderWhenResizing** (boolean, default: `false`): Show placeholder during resize
- **placeholder** (string | object, optional): Global placeholder image(s)
- **resizeThrottle** (number, default: `300`): Throttle delay in milliseconds for resize events

#### Render Methods

```javascript
// Render all auto-img elements
AutoImg.render();

// Render a specific element
AutoImg.render('#my-image');

// Render with override options
AutoImg.render('#my-image', { width: '500px', height: '400px' });

// Render multiple elements with different options
AutoImg.render([
  ['#image1'],
  ['#image2', { width: '300px' }],
  ['#image3', { height: '200px' }]
]);
```

#### Get Current Configuration

```javascript
const config = AutoImg.getConfig();
console.log(config);
```

### HTML Attributes Reference

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `src` | string | **required** | Image URL or base64 string |
| `width` | string | `100%` | Width of the container |
| `height` | string | `100%` | Height of the container |
| `placeholder` | string | optional | Placeholder image URL |
| `defer` | boolean | `false` | Whether to defer rendering |
| `focus` | string | optional | Focus area as "x1,y1;x2,y2" |
| `focus.tl` | string | optional | Focus area top-left as "x,y" |
| `focus.topleft` | string | optional | Alias for `focus.tl` |
| `focus.top-left` | string | optional | Alias for `focus.tl` |
| `focus.tr` | string | optional | Focus area top-right as "x,y" |
| `focus.topright` | string | optional | Alias for `focus.tr` |
| `focus.top-right` | string | optional | Alias for `focus.tr` |
| `focus.bl` | string | optional | Focus area bottom-left as "x,y" |
| `focus.bottomleft` | string | optional | Alias for `focus.bl` |
| `focus.bottom-left` | string | optional | Alias for `focus.bl` |
| `focus.br` | string | optional | Focus area bottom-right as "x,y" |
| `focus.bottomright` | string | optional | Alias for `focus.br` |
| `focus.bottom-right` | string | optional | Alias for `focus.br` |
| `allow-distortion` | boolean | `false` | Allow image stretching |
| `padding` | string | `0` | Minimum padding around focus area |
| `fetch-focus` | boolean | `false` | Fetch focus data from server |
| `fetch-upscale` | boolean | `false` | Fetch upscaled image from server |

### TypeScript Support

The library includes TypeScript definitions:

```typescript
import { AutoImg, GlobalConfig, RenderOptions } from 'autoimg-webcomponent';

const config: GlobalConfig = {
  imageServer: 'https://my-server.com',
  resizeRerender: true
};

AutoImg.init(config);

const options: RenderOptions = {
  width: '500px',
  height: '400px'
};

AutoImg.render('#my-image', options);
```

## Build from Source

```bash
# Navigate to the package directory
cd packages/webcomponent

# Install dependencies
npm install

# Build the library
npm run build

# Development mode (watch for changes)
npm run dev
```

The built files will be in the `dist/` folder:
- `index.js` - ES Module
- `index.cjs` - CommonJS
- `index.global.js` - IIFE (for `<script>` tags)
- `index.d.ts` - TypeScript definitions

## Examples

See `example.html` for complete working examples.

To test the examples:
1. Build the library: `npm run build`
2. Open `example.html` in a browser

## Integration with autoimg-core

This web component is built on top of `autoimg-core` which provides the image centering algorithms. Future updates will integrate the full centering functionality.

## Browser Support

The library uses modern web standards:
- Custom Elements (Web Components)
- Shadow DOM
- ResizeObserver

For older browser support, you may need polyfills.
