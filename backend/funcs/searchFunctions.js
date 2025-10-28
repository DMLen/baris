const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const phash = require("sharp-phash");
const dist = require("sharp-phash/distance");
const crypto = require ("crypto");
const db = require("../models");
const Images = db.images;
const Hashes = db.hashes;

async function hammingDistance(hash1, hash2) {
  if (hash1.length !== hash2.length) {
    throw new Error("Mismatched hash length!");
  }
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
}

//find nearest phash matches, very basic and not super effective
async function findPhashMatchesBrute(iPhash, threshold, limit) {
  const images = await Images.findAll({ include: [{ model: Hashes, as: 'hashes' }] });
  const matches = [];

  console.log(`DEBUG: Searching for phash matches to ${iPhash} with threshold ${threshold} and limit ${limit}`);
  for (const img of images) {
    if (!Array.isArray(img.hashes) || img.hashes.length === 0) continue;

    const phashEntry = img.hashes.find(h => (
      h.hashType && typeof h.hashType === 'string' && h.hashType.toLowerCase().includes('phash'))) || img.hashes[0]; 

    const storedPhash = phashEntry && (phashEntry.hashValue || phashEntry.hash);
    if (!storedPhash) continue;

    const hammingDistance = dist(iPhash, storedPhash);
    const hashLength = Math.max(iPhash.length, storedPhash.length) || 1;

    if (hammingDistance <= threshold) {
      matches.push({image: img, hammingDistance});
      console.log(`DEBUG: Found match - Image ID: ${img.id}, Stored Phash: ${storedPhash}, Hamming Distance: ${hammingDistance}`);
    } else {
      console.log(`DEBUG: No match - Image ID: ${img.id}, Stored Phash: ${storedPhash}, Hamming Distance: ${hammingDistance}`);
    }
  }
  
  matches.sort((a, b) => a.hammingDistance - b.hammingDistance);
  return matches.slice(0, limit);
}

async function findMatchesMultiHash(sha256, dhash, phash, hammingThreshold, limit) {

}

module.exports = { findPhashMatchesBrute, hammingDistance, findMatchesMultiHash };