import { AutoImg } from './components/AutoImg';
import './App.css';

function App() {
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
      </div>
    </div>
  );
}

export default App;
