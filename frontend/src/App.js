import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import axios from "axios";
import { ResultFragment } from './resultFragment.js';

function App() {
  const API_BASE = process.env.REACT_APP_API_BASE || ''; //uses localhost:5000/api/ when developing, defaults to relative path for build

  const [imgPreview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [hashes, setHashes] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [threshold, setThreshold] = useState(25);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    return () => {
      if (imgPreview) URL.revokeObjectURL(imgPreview);
    };
  }, [imgPreview]);

  useEffect(() => {
    if (hashes && hashes.phash) {
      executeSearch();
    }
  }, [hashes]);

  useEffect(() => {
    document.title = 'BARISTA';
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (imgPreview) URL.revokeObjectURL(imgPreview);
      setPreview(URL.createObjectURL(file));
      setSelectedFile(file);
      setHashes(null);
    } else {
      setPreview(null);
      setSelectedFile(null);
      setHashes(null);
    }
  };

  const doFileUpload = async () => {
    if (!selectedFile) {
      console.warn("No file selected");
      return;
    }
    const formData = new FormData();
    formData.append("userImage", selectedFile, selectedFile.name);
    try {
      console.log("DEBUG: Uploading file", selectedFile.name);
      const resp = await axios.post(`${API_BASE}/api/upload`, formData); //use localhost:5000/api/ in development, use /api/ for build
      console.log("Upload response:", resp.data);
      setHashes(resp.data || null);
    } catch (err) {
      console.error("Upload error:", err);
      setHashes(null);
    }
  };

  const executeSearch = async () => {
    if (!hashes) {
      console.warn("No hash data available for search");
      return;
    }
    try {
      console.log("DEBUG: Executing search with hashes", hashes);
      const phash = encodeURIComponent(hashes.phash);
      const dhash = encodeURIComponent(hashes.dhash);
      const sha256 = encodeURIComponent(hashes.sha256);
      const resp = await axios.get(`${API_BASE}/api/images/search/?sha256=${sha256}&dhash=${dhash}&phash=${phash}&threshold=${threshold}&limit=${limit}`);
      console.log("Search response:", resp.data);
      setSearchResults(resp.data || null);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults(null);
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
        <button className="fancybutton" onClick={doFileUpload}>Search</button>
        {hashes && (
          <div style={{ marginTop: 5, wordBreak: 'break-all', color: '#585858ff', fontSize: '14px' }}>
            <div>
            <strong>SHA256:</strong> <span>{hashes.sha256}</span>
            </div>
            <div>
            <strong>D-Hash:</strong> <span>{hashes.dhash}</span>
            </div>
            <div>
            <strong>P-Hash:</strong> <span>{hashes.phash}</span>
            </div>
          </div>
        )}
      </div>

      {/* render search results using fragments */}
      {searchResults && (
        <div className="search-results" style={{ marginTop: 18 }}>
          {searchResults.length === 0
            ? <div>No results</div>
            : searchResults.map((result, idx) => {
                const fallback = (result && result.image) ? result : { image: result, hammingDistance: null };
                const key = (fallback.image && fallback.image.id) ? fallback.image.id : idx;
                return <ResultFragment key={key} result={fallback} />;
              })
          }
        </div>
      )}
    </div>
  );
}

export default App;
