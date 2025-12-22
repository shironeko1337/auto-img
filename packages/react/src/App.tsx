import { useEffect } from 'react';
import { AutoImg } from './components/AutoImg';
import { autoImgAPI } from 'autoimg-core/api';
import './App.css';

function App() {
  const loadImage = () => {
    autoImgAPI.renderAll('auto-img,[data-auto-img]');
  };

  useEffect(() => {
    autoImgAPI.loadAll();
  }, []);

  return (
    <div className="app">
      <h1>AutoImg React Demo</h1>

      <div className="demo-grid">
        <div className="demo-item">
          <h2>Basic Usage</h2>
          <AutoImg
            src="https://picsum.photos/800/600"
            width="400px"
            height="300px"
            imgAlt="Random image from Picsum"
            imgLoading="lazy"
          />
        </div>

        <div className="demo-item">
          <h2>With Focus Point</h2>
          <AutoImg
            src="https://picsum.photos/id/237/800/600"
            width="400px"
            height="300px"
            focus="30,40;100,200"
            imgAlt="Dog photo with focus point"
            onClick={() => console.log('Image clicked!')}
          />
        </div>

        <div className="demo-item">
          <h2>With Placeholder</h2>
          <AutoImg
            src="https://picsum.photos/id/1015/800/600"
            width="400px"
            height="300px"
            placeholder="https://picsum.photos/id/1015/600/600"
            imgAlt="Mountain landscape"
            onMouseEnter={() => console.log('Mouse entered')}
            onMouseLeave={() => console.log('Mouse left')}
          />
        </div>

        <div className="demo-item">
          <h2>Responsive (100% width)</h2>
          <AutoImg
            src="https://picsum.photos/id/1018/1200/800"
            width="100%"
            height="300px"
            focus="200,200;700,700"
            allowDistortion={false}
            imgAlt="Responsive image"
          />
        </div>

        <div className="demo-item">
          <h2>Deferred Loading</h2>
          <button className="load-btn" onClick={loadImage}>Load Images</button>
          <AutoImg
            src="https://picsum.photos/id/1025/800/600"
            width="400px"
            height="300px"
            focus="50,50;100,100"
            placeholder="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiM5OTkiPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+"
            defer={true}
            imgAlt="Deferred loading example"
          />
        </div>

        <div className="demo-item">
          <h2>Native element</h2>
          <div
            data-auto-img
            data-auto-img-src="https://picsum.photos/id/1025/800/600"
            style={{ width: '400px', height: '300px' }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
