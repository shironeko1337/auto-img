# AutoImg
A library for resizing and shifting image to make content focused.

Before diving in this repository, think of these questions:

- What do we need to show an image?
- What is the goal for showing an image?

---

Here are my answers:

What do we need to show an image?

- An image source.
- A container.

What is the goal for showing an image?

- Driving user focus.
- Enriching UI.

If you and me share similar ideas, bingo! This repository might be helpful to you.

## Basic usages
1. Load package from any of
- Script tag ```<script ```
- `npm install @autoimg/core`

### Web component
You can define a web component in your template file which would be automatically rendered and adjusted to center the focus on resizing.
```html
<auto-img
```
- `src`: Src of an image file
- `placeholder`: A placeholder image showing before image completes loading, preferred to be a base64 image.
- `width`: (Optional) Rendered image width, the CSS value of the width of the inner container element under shadow root.
- `height`: (Optional) Rendered image height, the CSS value of the width of the inner container element under shadow root.
- `focus`: Coordinates of focus top left corner and bottom right corner, the top left corner of image is (0,0), can be set with `focus="100,200;200,300"`.
- `allow-distortion`: If we allow image to be distorted and to be stretched to the container border.
- `padding`: How much space in pixels at least should be left between the focus area and the container area.

### Elements with `background-image` ([Demo]())
In your template file:
```html
<div
```

In your JavaScript file:
```js

```

Properties with a `data-autoimg-` prefix and same functionality: `data-autoimg-focus`, `data-autoimg-allow-distortion`. `data-autoimg-padding`.

Properties that doesn't exist:
- `src`: It's can be set through CSS.
- `placeholder`: AutoImg has no idea when `background-image` is loaded, so placeholder can not be set to prevent showing placeholder after loaded.
- `width` and `height`: Dimensions of such element is controlled by styles and scripts outside of AutoImg and subject to resizing. AutoImg only monitors and retrieve dimensions when they are stable.


# Todos
- [x] Implement core functionalities.
- [x] Add tests for core functionalities
- [x] Create a demo page for visualizing the transformation and configurations.
- [x] Design the core APIs and implement the web component adapter.
- [ ] Add tests for web component functionalities.
  - [ ] Unit tests for base model.
- [ ] Create a demo page for use scenario showcase of `auto-img`.
  - [ ] Move the following examples to a demo file and attach links.
  - [ ] Complete the README docs.
- [ ] Publish web component npm bundle and setup pipeline.
- [ ] Vue adapter.
- [ ] Tests for Vue adapter.
- [ ] Create a simple Vue demo page with the same demos as web component.
- [ ] Publish Vue npm bundle and setup pipeline.
- [ ] React adapter.
- [ ] Tests for React adapter.
- [ ] Create a simple React demo page with the same demos as web component.
- [ ] Publish React npm bundle and setup pipeline.
- [ ] Promoting the library?
- [ ] Further optimizations, more friendly API? get faster? Different version of images based on container size? Using a self hosting website and AI to auto find focus or auto upscaling?...

# Hot patches
- [x] If background is provided as `[data-auto-img-src]` in html element, it should override `background-image` style.
- [x] If background is not provided in html element, read background from backgroundImage property.
- [ ] Fix visualize animation.
- [x] Allow another format of focus to be defined  `focus="200,300"`, it's the coordinates of the focus center, and in that case, the focus area is the largest rectangle with the same w/h ratio of the image.
- [x] Adjust the design to have codesandbox demo only for the easiest use case, for all other cases, use a full page
- [ ] See if there are MDX plugin available to show highlighted code.
- [ ] Not sure what's the best practice for wrapping a library, now both API singleton and Element type are wrapped in a namespace, how do we want to wrap the react and vue libraries?
- [ ] Find a way to move README files into the demo page with MDX format so that we once the playground is moved to demo page, we can call demo page done, all the things left is to finanlize the README files.

```html
<auto-img src="..." width="200" height="200" />
```


```html
<auto-img src="..." placeholder="..." />
```

```html
<div>
  <label>A container with responsive dimensions</label>
  <div style="">
    <auto-img src="..."  />
  </div>
</div>
```


## Roadmap
### Used as a thrid-party util
