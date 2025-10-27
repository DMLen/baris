import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="topform">
      <h1 className="main-title">B.A.R.I.S.T.A.</h1>
      <h2 className="subtitle">Basic-Arse Reverse Image Search Tool (Amazing)</h2>

      <div className="UploadComponent">
        <p>Upload an image and select variables to get started!</p>
        <input type="file" name="userImage" />
      </div>

    </div>
  );
}

export default App;
