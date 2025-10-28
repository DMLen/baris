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
  const thumbFullPath = path.join(thumbDir, filename);
  await sharp(buffer).resize(100, 100).jpeg({ quality: 80 }).toFile(thumbFullPath);
  const webPath = `/img/thumb/${filename}`;
  console.log("DEBUG: Thumbnail saved at", thumbFullPath, " -> web path:", webPath);
  return webPath;
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

//https://www.hackerfactor.com/blog/index.php?/archives/529-Kind-of-Like-That.html
async function generateDhash(buffer, columns = 9, rows = 8) {
  //reduce colour and size before processing bits
  const raw = await sharp(buffer)
    .grayscale()
    .resize(columns, rows)
    .raw()
    .toBuffer();
  

  let bits = '';
  for (let y = 0; y < rows; y++) { //iterate rows, start top-left
    for (let x = 0; x < columns - 1; x++) { //iterate columns
      const i = y * columns + x; //get index
      bits += raw[i] > raw[i + 1] ? '1' : '0'; //if current pixel i brighter than i+1, set bit to 1, else 0, before appending
    }
  }

  console.log("DEBUG: Generated dhash:", bits);
  return bits;
}

module.exports = { getImageBuffer, getDimensions, saveThumb, generatePhash, generateHash, generateDhash };
