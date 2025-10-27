const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const phash = require("sharp-phash");
const dist = require("sharp-phash/distance");
const crypto = require ("crypto");

//same as on backend but for frontend use

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
