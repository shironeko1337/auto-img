<script setup lang="ts">
const handleClick = () => {
  console.log('Image clicked!');
};

const handleMouseEnter = () => {
  console.log('Mouse entered');
};

const handleMouseLeave = () => {
  console.log('Mouse left');
};
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
          placeholder="https://via.placeholder.com/400x300?text=Loading..."
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
          focus="0.5,0.5"
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
          focus.tl="0.2,0.3"
          focus.br="0.8,0.7"
          padding="10"
          img-alt="Advanced focus example"
        />
      </div>

      <div class="demo-item">
        <h2>Deferred Loading</h2>
        <auto-img
          src="https://picsum.photos/id/1025/800/600"
          width="400px"
          height="300px"
          :defer="true"
          img-alt="Deferred loading example"
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

@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
