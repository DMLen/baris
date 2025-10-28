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

function findHashes(img, type, value) {
  if (!Array.isArray(img.hashes) || img.hashes.length === 0) return [];
  return img.hashes.filter(h => {
    if (!h || !h.hashType || typeof h.hashType !== 'string') return false;
    if (!h.hashType.toLowerCase().includes(type.toLowerCase())) return false;
    const hv = h.hashValue || h.hash;
    return hv === value;
  });
}

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

//wip
async function findMatchesMultiHash(sha256, dhash, phash, hammingThreshold, limit) {
  const resultIds = []; //image ids that match or are within threshold
  const matchingHashes = []; //potential matches within hamming threshold
  console.log(`DEBUG: Doing multi-hash search with SHA256: ${sha256}, DHash: ${dhash}, PHash: ${phash}, Hamming Threshold: ${hammingThreshold}, Limit: ${limit}`);

  //first step: look for exact sha256 matches, store image id to matchid list
  //this bypasses hamming distance calculations and scoring
  const shaQuery = `SELECT * FROM Hashes WHERE hashType LIKE :ht AND hashValue = :hv`
  const shaMatches = await db.sequelize.query(shaQuery, {
    replacements: { ht: 'sha256', hv: sha256 },
    type: db.sequelize.QueryTypes.SELECT
  });
  for (const match of shaMatches) {
    resultIds.push(match.imageId);
    console.log(`DEBUG: Found exact SHA256 match - Image ID: ${match.imageId}`);
  }

  //second step: calculate dhash hamming distances and add to "maybe" fuzzy list
  const dhashQuery = `SELECT * FROM Hashes WHERE hashType LIKE :ht`
  const dhashes = await db.sequelize.query(dhashQuery, {
    replacements: { ht: 'dhash' },
    type: db.sequelize.QueryTypes.SELECT
  });
  for (const result of dhashes) {
    const hammingDist = await hammingDistance(dhash, result.hashValue);
    if (hammingDist <= hammingThreshold) {
      matchingHashes.push({ imageId: result.imageId, hammingDistance: hammingDist, type: 'dhash' });
      console.log(`DEBUG: Found fuzzy DHash match - Image ID: ${result.imageId}, Hamming Distance: ${hammingDist}`);
    }
  }
  console.log("DEBUG: matchingHashes after second step:", matchingHashes);

  //third step: calculate phash hamming distances and add to "maybe" fuzzy list
    const phashQuery = `SELECT * FROM Hashes WHERE hashType LIKE :ht`
  const phashes = await db.sequelize.query(phashQuery, {
    replacements: { ht: 'phash' },
    type: db.sequelize.QueryTypes.SELECT
  });
  for (const result of phashes) {
    const hammingDist = await hammingDistance(phash, result.hashValue);
    if (hammingDist <= hammingThreshold) {
      matchingHashes.push({ imageId: result.imageId, hammingDistance: hammingDist, type: 'phash' });
      console.log(`DEBUG: Found fuzzy PHash match - Image ID: ${result.imageId}, Hamming Distance: ${hammingDist}`);
    }
  }
 console.log("DEBUG: matchingHashes after third step:", matchingHashes);
    //example:
    //DEBUG: matchingHashes after third step: [
    //{ imageId: 1, hammingDistance: 2, type: 'dhash' },
    //{ imageId: 1, hammingDistance: 0, type: 'phash' }
    //]

  //fourth step: process fuzzy list: combine dhash and phash distances into some kind of score, sort by score for overall accuracy
  const weights = { phash: 0.5, dhash: 0.5 };
  const scores = {}; //imageId -> score
  
  for (const match of matchingHashes) {
    const { imageId, hammingDistance, type } = match;
    const weight = weights[type];
    scores[imageId] = (scores[imageId] || 0) + (weight * (1 / (hammingDistance + 1)));
  }

  // Sort scores by highest first
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  console.log("DEBUG: Sorted scores:", sortedScores);
  resultIds.push(...sortedScores.map(([imageId, score]) => parseInt(imageId)));


  //fifth step: retrieve images by match ids and return
  const resultImages = await Images.findAll({
    where: { id: resultIds },
    include: [{ model: Hashes, as: 'hashes' }]
  });

  return resultImages.slice(0, limit);
}


module.exports = { findPhashMatchesBrute, hammingDistance, findMatchesMultiHash };