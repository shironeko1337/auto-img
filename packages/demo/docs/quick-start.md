# Quick start

**Install Webcomponent and API**

```bash
npm install autoimg -D
```

```html
<auto-img
  src="..."
  width="200"
  height="200"
  focus="27,235;452,490"
  padding="10"></auto-img>
```

**Install Only API**:
```bash
npm install autoimg-core/api -D
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

<!--
**Use via CDN**
```html
<script type="module" src="https://unpkg.com/autoimg"></script>
``` -->
