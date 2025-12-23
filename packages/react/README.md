# Autoimg React

## Description

React component wrapper for AutoImg - provides a React component for content-aware image resizing and focusing. This package wraps the AutoImg web component with proper React integration, TypeScript support, and React-friendly props.

## Installation

```bash
npm install @shironeko1052/autoimg-react
```

## Usage

```tsx
import { AutoImg } from '@shironeko1052/autoimg-react';

function App() {
  return (
    <AutoImg
      src="https://example.com/image.jpg"
      width="400"
      height="300"
      focus="100,200;300,400"
      padding="10"
      placeholder="data:image/..."
      imgAlt="Description"
      onClick={() => console.log('Clicked!')}
    />
  );
}
```

For more details and examples, see the [main repository](https://github.com/shironeko1337/auto-img).
