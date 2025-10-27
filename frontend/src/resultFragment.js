import React from 'react';

export function ResultFragment({ result }) {
  if (!result) return null;

  const img = result.image || {};
  const thumbUrl = img.thumbnailPath ? `http://localhost:5000${img.thumbnailPath}` : null;

  const hashes = img.hashes || [];
  const phashObj = hashes.find(h => h.hashType === 'phash');
  const shaObj = hashes.find(h => h.hashType === 'sha256');
  const phash = phashObj ? phashObj.hashValue : (img.phash || '');
  const sha256 = shaObj ? shaObj.hashValue : (img.sha256 || '');

  return (
    <>
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', border: '2px solid #898989ff', padding: 12, marginBottom: 12 }}>
      <div>
        {thumbUrl && (<img src={thumbUrl} alt={`thumb-${img.id}`} />)}
      </div>

      <div style={{ flex: 1, textAlign: 'left' }}>
          <div><strong>Image ID:</strong> {img.id}</div>
          <div><strong>Hamming Distance:</strong> {result.hammingDistance}</div>
          <div><strong>Origin:</strong> {img.origin}</div>
          <div>{img.width} × {img.height}</div>

          <div style={{ marginTop: 8, fontSize: '8px', color: '#777' }}>
          <div><strong>SHA256:</strong> {sha256}</div>
          <div><strong>P-Hash:</strong> {phash}</div>
          <div><strong>Indexed:</strong> {img.timestamp}</div>
          </div>
      </div>
    </div>
    </>
  );
}