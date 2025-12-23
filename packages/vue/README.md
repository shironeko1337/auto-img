# Autoimg Vue

[![npm](https://img.shields.io/npm/v/@shironeko1052/autoimg-vue)](https://www.npmjs.com/package/@shironeko1052/autoimg-vue)

## Description

Vue component wrapper for AutoImg - provides a Vue component for content-aware image resizing and focusing. This package wraps the AutoImg web component with proper Vue 3 integration, TypeScript support, and Vue-friendly props. Vue 3 has excellent native support for web components, making integration seamless.

## Installation

```bash
npm install @shironeko1052/autoimg-vue
```

## Usage

```vue
<template>
  <AutoImg
    src="https://example.com/image.jpg"
    width="400"
    height="300"
    focus="100,200;300,400"
    padding="10"
    placeholder="data:image/..."
    img-alt="Description"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { AutoImg } from '@shironeko1052/autoimg-vue';

const handleClick = () => {
  console.log('Clicked!');
};
</script>
```

For more details and examples, see the [main repository](https://github.com/shironeko1337/auto-img).
