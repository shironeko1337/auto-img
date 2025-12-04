## Core HTML API
Core HTML API is designed to have enough flexibility and easy to use. For focus attributes, you can use abbreviated or expanded forms:
- Abbreviated: `focus.tl`, `focus.tr`, `focus.bl`, `focus.br`
- Expanded (no hyphen): `focus.topleft`, `focus.topright`, `focus.bottomleft`, `focus.bottomright`
- Expanded (with hyphen): `focus.top-left`, `focus.top-right`, `focus.bottom-left`, `focus.bottom-right`

### Render

For rendering ,first we need to know the container dimensions (width and height). It can be defined in the image element itself or defined as 100% which is defer calculated at certain conditions.

- `src`: Required string for image url or base64 string, format is the same as src input for `HTMLImageElement`.
- `width`: Optional string for `auto-img` width, default to be `100%`.
- `height`: Optional string for `auto-img` height, default to be `100%`.
- `placeholder`: Optional string for a placeholder image that shows during before render, can be override in the global config. This is only available for web component, as usages like `<img src="A" data-autoimg-placeholder="B"` have no guarantee that placeholder is loaded before the actual image.
- `defer`: Optional boolean indicating whether to defer rendering. **Must** call `AutoImg.render` manually if it's `true`.

#### Usages

Fixed size:

```html
<auto-img width="100px" height="100px" ... />
```

Fill in parent:

```html
<div style="width: 100px; height: 100px;">
  <auto-img placeholder="..." ... />
</div>
```

Defer rendered:

```html
<div style="width: 100px; height: 100px;">
  <auto-img defer id="my-img-id1" width="50" />
  <auto-img defer id="my-img-id2" ... />
</div>
```

```js
someObservable.on("heavy layout calculations done", () => {
  AutoImg.render(); // render all img
  AutoImg.render("#my-img-id1"); // render one image
  AutoImg.render("#my-img-id1", { width: "100px" }); // render one image with width override
  AutoImg.render([["#my-img-id1"], ["#my-img-id2", { height: "100px" }]]); // render each img with different dimensions
});
```
### Center
These are the inputs as configs for center algorithm:

- `focus`, required structure value, can be set by:
  - Combined format: `focus="100,200;200,300"`
  - Separate attributes: `focus.tl="100,200" focus.br="200,300"`
  - Or using aliases: `focus.topleft="100,200"`, `focus.top-left="100,200"`
- `allowDistortion`, optional boolean value default to `false`.
- `padding`: Optional non-negative string value, can be `20`, `20px`. The minimum distance from any of the focus area border to container border when algorithm is finished, should be less than min(container.width, container.height) / 2. If it doesn't meet the requirements, throw a warning and treat it as 0.
- `fetchFocus`: Optional boolean value default to `false`. If set to `true`, fetch focus data from remote server using `src`.
- `fetchUpscale`: Optional boolean value default to `false`. If set to `true`, fetch upscaled image from remote server using `src` and upscaling parameters.

#### Usages
```html
<auto-img
  src="..."
  focus="100,200;200,300"
  (allow-distortion)
  (padding)
  (fetch-focus)
  (fetch-upscale)
/>
```

## Core JS API

### Initialize

On loading AutoImg library, the initialize library would be called immediately. You can also initialize with global configs, by calling `AutoImg.init`, it would override the default config and restart rendering if there is a rendering process going on.

All following inputs can be passed as data attributes on the `script` tag,, e.g. `<script image-server="" .../>`.

- `imageServer`: Optional string for the server to fetch pre-calculated image data, must be set when fetch-focus or fetch-upscale is set.
- `resizeRerender`: Optional boolean default to `true`. Whether render image again when resizing
- `showPlaceholderWhenResizing`: Optional boolean default to `false`. Whether show placeholder when resizing (not initial rendering).
- `placeholder`: Optional, can be either an image src or an object. When it's an image src, it works as if all `<auto-img` elements has the same placeholder input. When it's an object, let's say key name is `big`, and key value is the src of a big placeholder, it can be used like this: `<auto-img placeholder="big" ..../>`.
- `resizeThrottle`: Optional non-negative number of milliseconds default to 300. Throttle interval of resizing.

```js
AutoImg.init({
  imageServer: 'https://my-image-server.com',
  resizeRerender: false,
  showPlaceholderWhenResizing: false,
  placeholder: {
    'big': 'https://images/a-big-placeholder.png',
    'small': 'https://images/a-small-placeholder.png',
  },
  resizeThrottle: 300,
})
```
