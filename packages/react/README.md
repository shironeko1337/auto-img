# AutoImg React Demo

A minimal React demo showcasing the `autoimg-webcomponent` integration.

## Features

- TypeScript type definitions for the `<auto-img>` custom element
- React wrapper component with proper property handling
- Standard event handlers (onClick, onMouseEnter, etc.) work automatically
- Demo showcasing various features: focus points, placeholders, responsive images

## Project Structure

```
packages/react/
├── src/
│   ├── components/
│   │   └── AutoImg.tsx          # React wrapper component
│   ├── auto-img.d.ts            # TypeScript declarations
│   ├── App.tsx                  # Demo application
│   ├── App.css                  # Styles
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── index.html                   # HTML template
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
```

## Development

1. Make sure the webcomponent package is built:
   ```bash
   cd ../webcomponent
   npm run build
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

## Build

```bash
npm run build
```

## Usage

```tsx
import { AutoImg } from './components/AutoImg';

function App() {
  return (
    <AutoImg
      src="https://example.com/image.jpg"
      width="400px"
      height="300px"
      focus="0.5,0.5"
      imgAlt="Description"
      allowDistortion={false}
      onClick={() => console.log('Clicked!')}
    />
  );
}
```

## Available Props

See `src/components/AutoImg.tsx` for the complete list of props, including:
- Core: `src`, `width`, `height`
- Image attrs: `imgAlt`, `imgLoading`, `imgTitle`, etc.
- Model attrs: `focus`, `focusCenter`, `padding`, `placeholder`, etc.
- Events: All standard HTML events (`onClick`, `onMouseEnter`, etc.)
