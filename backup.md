# AutoImg
A library for resizing and shifting image to make content focused. 🎯

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

## 🚀 Basic usages
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


## ✅ Todos
- [x] Implement core functionalities.****
- [x] Add tests for core functionalities
- [x] Create a demo page for visualizing the transformation and configurations.
- [x] Design the core APIs and implement the web component adapter.
- [x] Add tests for web component functionalities.
  - [x] Unit tests for base model.
- [x] Create a demo page for use scenario showcase of `auto-img`.
  - [x] Move the following examples to a demo file and attach links.
  - [x] Implement a demo for <auto-img/> with placeholders
  - [x] Implement a demo for defer rendering of <auto-img/> (for native elements we can only defer centralizing which is too trivial to demo)
- [x] Examine unit tests
  - [x] Implement attrValidation and add unit test
  - [x] Add unit tests for placeholder and defer rendering for auto-img element
- [x] Separate the api out, so that when importing the library
  - if user only wants webcomponent / react component / vue component, use `<script src=".../webcomponent.js"` or `import AutoImg from '@auto-img/react'`
  - if user only wants render API, use `<script src=".../api.js"` or `import AutoImgAPI from '@auto-img/api'`.
- [x] Implement another version of demos using native HTML elements (basically copy the webcomponent demo)
  - [ ] Add 2 unit tests for loading native HTML elements.
- [x] Vue adapter.
- [x] Tests for Vue adapter.
- [x] In demo page, add a demo for vue component.
- [x] React adapter.
- [x] Tests for React adapter.
  - [x] Passes prop correctly to webcomponent.
  - [x] Users can call web component functions by using a ref.
- [x] Review the vibe coded demos and unit tests react and vue
- [x] Finalize README docs.
- [x] Setup CICD pipeline.
- [ ] Upload npm packages and enable CDN usage.
- [ ] Setup an online demo.
- [ ] In demo page, add react and vue demos in codesandbox.
- [ ] Further optimizations, more friendly API? get faster? Different version of images based on container size? Using a self hosting website and AI to auto find focus or auto upscaling?...

# Hot patches
- [x] If background is provided as `[data-auto-img-src]` in html element, it should override `background-image` style.
- [x] If background is not provided in **html** element, read background from backgroundImage property.
- [x] Allow another format of focus to be defined  `focus="200,300"`, it's the coordinates of the focus center, and in that case, the focus area is the largest rectangle with the same w/h ratio of the image.
- [x] Adjust the design to have codesandbox demo only for the easiest use case, for all other cases, use a full page
- [x] Propagate properties to img in auto-img element to preserve the native functions such as only load when visible.
- [x] Fix visualize animation.
- [x] Move centralizer playground to demo.
- [x] Find a way to render static README files in the demo.
- [ ] use a static image to replace all occurances in the demo
- [ ] make screenshot test results identical xos


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


## 🗺️ Roadmap
### Used as a thrid-party util
