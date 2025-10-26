const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const phash = require("sharp-phash");
const dist = require("sharp-phash/distance");
const crypto = require ("crypto");

async function getImageBuffer(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

function getDimensions(buffer) {
  return sharp(buffer)
    .metadata()
    .then((metadata) => {
      return {
        width: metadata.width,
        height: metadata.height,
      };
    });
}

async function saveThumb(buffer) {
  const thumbDir = path.join(__dirname, '..', 'img', 'thumb');
  await fs.promises.mkdir(thumbDir, { recursive: true });
  const filename = `${Date.now()}_thumb.jpg`;
  const thumbPath = path.join(thumbDir, filename);
  await sharp(buffer).resize(100, 100).jpeg({ quality: 80 }).toFile(thumbPath);
  console.log("DEBUG: Thumbnail saved at", thumbPath);
  return thumbPath;
}

async function generatePhash(buffer) {
  const perceptualHash = await phash(buffer);
  console.log("DEBUG: Generated phash:", perceptualHash);
  return perceptualHash;
}

function generateHash(buffer) {
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  console.log("DEBUG: Generated SHA-256 hash:", sha256);
  return sha256;
}

module.exports = { getImageBuffer, getDimensions, saveThumb, generatePhash, generateHash };
