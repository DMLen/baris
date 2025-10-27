import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';

function App() {
  const [imgPreview, setPreview] = useState(null);

  useEffect(() => {
    return () => {
      if (imgPreview) URL.revokeObjectURL(imgPreview);
    };
  }, [imgPreview]);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (imgPreview) URL.revokeObjectURL(imgPreview);
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="topform">
      <h1 className="main-title">B.A.R.I.S.T.A.</h1>
      <h2 className="subtitle">Basic-Arse Reverse Image Search Tool (Amazing)</h2>

      <div className="UploadComponent">
        {imgPreview && (
          <div style={{ marginTop: 12 }}>
            <img src={imgPreview} alt="preview" style={{ maxWidth: 200, maxHeight: 200, objectFit: 'cover', borderRadius: 4 }} />
          </div>
        )}
        <p>Upload an image to get started!</p>
        <input type="file" name="userImage" accept="image/*" onChange={handleFileChange} />
        <button className="fancybutton">Search</button>
      </div>

    </div>
  );
}

export default App;
