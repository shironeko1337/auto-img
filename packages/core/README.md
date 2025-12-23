# AutoImg Core

[![npm](https://img.shields.io/npm/v/@shironeko1052/autoimg-core)](https://www.npmjs.com/package/@shironeko1052/autoimg-core)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@shironeko1052/autoimg-core?label=core%2Fapi%20size&color=blue)](https://bundlephobia.com/package/@shironeko1052/autoimg-core)

## Description

Core library for AutoImg - provides the fundamental algorithms and models for content-aware image resizing and focusing. This package contains the core logic for calculating optimal image positioning based on defined focus areas, enabling images to maintain visual focus when displayed in containers of varying dimensions.

## Installation

```bash
npm install @shironeko1052/autoimg-core
```

## Usage

```javascript
import { AutoImgModel } from '@shironeko1052/autoimg-core';
import { autoImgAPI } from '@shironeko1052/autoimg-core/api';

// Use the API to load and render images
autoImgAPI.loadAll('[data-auto-img]');
```

For more details and examples, see the [main repository](https://github.com/shironeko1337/auto-img).
