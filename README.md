# 📸 AutoImg

[![webcomponent bundle](https://img.shields.io/bundlephobia/minzip/@shironeko1052/autoimg?label=size%20(minified%20%2B%20gzipped))](https://bundlephobia.com/package/@shironeko1052/autoimg)
[![api bundle](https://img.shields.io/bundlephobia/minzip/@shironeko1052/autoimg-core?label=core%2Fapi%20size&color=blue)](https://bundlephobia.com/package/@shironeko1052/autoimg-core)
[![CI](https://github.com/shironeko1337/auto-img/actions/workflows/ci.yml/badge.svg)](https://github.com/shironeko1337/auto-img/actions/workflows/ci.yml)
[![Snyk security](https://snyk.io/test/github/shironeko1337/auto-img/badge.svg)](https://snyk.io/test/github/shironeko1337/auto-img)

- 🎯 Position images automatically while first loading and resizing.
- ⚙️ Webcomponent, react component, vue component, pure API available to use.
- 🎮 A playground to for core positioning algorithm.
- ✅ Baseline [Compatibility](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility).

## 🎬 Demo
[Live demo](https://shironeko1337.github.io/auto-img/)

**💻 Local hosting**
```bash
npm install @shironeko1052/autoimg-demo
npx serve .
```

## 🚀 Quick start

**📦 Install Webcomponent and API**

```bash
npm install @shironeko1052/autoimg -D
```

```html
<auto-img
  src="..."
  width="200"
  height="200"
  focus="27,235;452,490"
  padding="10"></auto-img>
```

**🔧 Install Only API**:
```bash
npm install @shironeko1052/autoimg-core/api -D
```

```html
<div style="width:200px; height:200px;">
  <div
    style="width: 100%; height: 100%; background-image: ...;"
    data-auto-img
    data-auto-img-focus="27,235;452,490"
    data-auto-img-padding="10">
  </div>
</div>

<script>AutoImgAPI.loadAll('[data-auto-img]');</script>
```

**🌐 Use via CDN**

```html
  <script type="module" src="https://unpkg.com/@shironeko1052/autoimg"></script>
```

## 📄 License
Copyright (c) 2025, Liyi Zhang. (MIT License)

## Credits

Icons used in the demo from:
- [Material Design Icons](https://materialdesignicons.com/) - Apache 2.0 License
- [Material Symbols](https://fonts.google.com/icons) - Apache 2.0 License
- [Icon Park](https://icon-park.oceanengine.com/) - Apache 2.0 License
- [Google Material Icons](https://fonts.google.com/icons) - Apache 2.0 License

All icons provided via [Iconify](https://iconify.design/)
