# Autoimg Webcomponent

## Description

Web component implementation of AutoImg - provides the `<auto-img>` custom element for content-aware image resizing and focusing. This package allows you to use AutoImg as a standard HTML custom element that automatically adjusts image positioning based on container size and defined focus areas.

## Installation

```bash
npm install autoimg
```
## Usage

```html
<auto-img
  src="https://example.com/image.jpg"
  width="200"
  height="200"
  focus="100,200;300,400"
  padding="10"
  placeholder="data:image/...">
</auto-img>
```

For more details and examples, see the [main repository](https://github.com/shironeko1337/auto-img).
