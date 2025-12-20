# AutoImg Vue Demo

A minimal Vue 3 demo showcasing the `autoimg-webcomponent` integration.

## Features

- **Native Support**: Vue 3 has excellent native support for web components
- **Direct Usage**: Use `<auto-img>` directly in templates without wrapper components
- **v-bind Support**: Use `:prop` syntax for reactive properties
- **Event Handling**: Standard `@click`, `@mouseenter` etc. work automatically
- **Dotted Attributes**: Can use attributes like `focus.tl` directly in templates
- 6 Demo examples showcasing various features

## Why Vue is Easier Than React

Vue has first-class web component support:
- ✅ Use custom elements directly in templates
- ✅ No wrapper component needed
- ✅ Automatic property vs attribute handling
- ✅ Standard event listeners work out of the box
- ✅ Can use dotted attributes like `focus.tl` directly
- ✅ Just configure `isCustomElement` in Vite config

## Project Structure

```
packages/vue/
├── src/
│   ├── App.vue                  # Demo application with 6 examples
│   ├── main.ts                  # Entry point
│   ├── style.css                # Global styles
│   └── vite-env.d.ts            # Type declarations
├── index.html                   # HTML template
├── vite.config.ts               # Vite configuration (custom element config)
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

Simply use `<auto-img>` in your Vue templates:

```vue
<template>
  <auto-img
    src="https://example.com/image.jpg"
    width="400px"
    height="300px"
    focus="0.5,0.5"
    img-alt="Description"
    :allowDistortion="false"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
const handleClick = () => {
  console.log('Clicked!');
};
</script>
```

## Available Attributes

All observed attributes from the web component work directly:

**Core:**
- `src`, `width`, `height`

**Image attributes (prefixed with `img-`):**
- `img-alt`, `img-loading`, `img-title`, `img-draggable`, `img-crossOrigin`, `img-decoding`, `img-fetchPriority`

**Model attributes:**
- `focus`, `focusCenter`, `padding`, `placeholder`
- `focus.tl`, `focus.tl.x`, `focus.tl.y`, `focus.br`, `focus.br.x`, `focus.br.y`
- `defer`, `allowDistortion`

**Reactive Properties:**
Use `:prop` syntax for boolean/reactive values:
```vue
<auto-img :defer="true" :allowDistortion="false" />
```

**Events:**
All standard DOM events work:
```vue
<auto-img @click="..." @mouseenter="..." @mouseleave="..." />
```

## Key Configuration

The only Vue-specific configuration needed is in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Tell Vue to treat auto-img as a custom element
          isCustomElement: (tag) => tag === 'auto-img'
        }
      }
    })
  ],
})
```

This tells Vue to skip trying to resolve `<auto-img>` as a Vue component and treat it as a native custom element instead.
