<script setup lang="ts">
import { onMounted } from "vue";
import { autoImgAPI } from "@shironeko1052/autoimg-core/api";

const loadImage = () => {
  autoImgAPI.renderAll("auto-img,[data-auto-img]");
};

const handleClick = () => {
  console.log("Image clicked!");
};

const handleMouseEnter = () => {
  console.log("Mouse entered");
};

const handleMouseLeave = () => {
  console.log("Mouse left");
};

onMounted(() => {
  autoImgAPI.loadAll();
});
</script>

<template>
  <div class="app">
    <h1>AutoImg Vue Demo</h1>

    <div class="demo-grid">
      <div class="demo-item">
        <h2>Basic Usage</h2>
        <auto-img
          src="https://picsum.photos/800/600"
          width="400px"
          height="300px"
          img-alt="Random image from Picsum"
          img-loading="lazy"
        />
      </div>

      <div class="demo-item">
        <h2>With Focus Point</h2>
        <auto-img
          src="https://picsum.photos/id/237/800/600"
          width="400px"
          height="300px"
          focus="0.3,0.4"
          img-alt="Dog photo with focus point"
          @click="handleClick"
        />
      </div>

      <div class="demo-item">
        <h2>With Placeholder</h2>
        <auto-img
          src="https://picsum.photos/id/1015/800/600"
          width="400px"
          height="300px"
          placeholder="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiM5OTkiPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+"
          img-alt="Mountain landscape"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        />
      </div>

      <div class="demo-item">
        <h2>Responsive (100% width)</h2>
        <auto-img
          src="https://picsum.photos/id/1018/1200/800"
          width="100%"
          height="300px"
          focus="50,50;100,100"
          :allowDistortion="false"
          img-alt="Responsive image"
        />
      </div>

      <div class="demo-item">
        <h2>Advanced Focus (Top-Left & Bottom-Right)</h2>
        <auto-img
          src="https://picsum.photos/id/180/800/600"
          width="400px"
          height="300px"
          focus.tl="100,100"
          focus.br="200,200"
          padding="10"
          img-alt="Advanced focus example"
        />
      </div>

      <div class="demo-item">
        <h2>Deferred Loading</h2>
        <button class="load-btn" @click="loadImage()">Load Images</button>
        <auto-img
          src="https://picsum.photos/id/1025/800/600"
          width="400px"
          height="300px"
          placeholder="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiM5OTkiPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+"
          :defer="true"
          img-alt="Deferred loading example"
        />
      </div>

      <div class="demo-item">
        <h2>Native element</h2>
        <div
          data-auto-img
          data-auto-img-src="https://picsum.photos/id/1025/800/600"
          style="width: 400px; height: 300px"
          data-auto-img-defer
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  color: #42b983;
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #888;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.demo-item {
  padding: 1rem;
  border: 1px solid #333;
  border-radius: 8px;
  background: #1a1a1a;
}

.demo-item auto-img {
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 4px;
  overflow: hidden;
}

.demo-item auto-img:hover {
  transform: scale(1.02);
}

.load-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(66, 185, 131, 0.2);
}

.load-btn:hover {
  background: #35a372;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 185, 131, 0.3);
}

.load-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(66, 185, 131, 0.2);
}

@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
