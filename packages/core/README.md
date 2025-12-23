# AutoImg Core

<!-- Uncomment after publishing to npm -->
<!-- [![npm bundle size](https://img.shields.io/bundlephobia/minzip/autoimg-core?label=size%20(minified%20%2B%20gzipped))](https://bundlephobia.com/package/autoimg-core) -->

## Description

Core library for AutoImg - provides the fundamental algorithms and models for content-aware image resizing and focusing. This package contains the core logic for calculating optimal image positioning based on defined focus areas, enabling images to maintain visual focus when displayed in containers of varying dimensions.

## Installation

```bash
npm install autoimg-core
```

## Usage

```javascript
import { AutoImgModel } from 'autoimg-core';
import { autoImgAPI } from 'autoimg-core/api';

// Use the API to load and render images
autoImgAPI.loadAll('[data-auto-img]');
```

For more details and examples, see the [main repository](https://github.com/shironeko1337/auto-img).
