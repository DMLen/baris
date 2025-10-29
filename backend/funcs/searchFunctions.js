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
  console.log(`DEBUG: Doing multi-hash search with SHA256: ${sha256}, DHash: ${dhash}, PHash: ${phash}, Hamming Threshold: ${hammingThreshold}, Limit: ${limit}`);

  const shaQuery = `SELECT * FROM Hashes WHERE hashType LIKE :ht AND hashValue = :hv`;
  const dhashQuery = `SELECT * FROM Hashes WHERE hashType LIKE :ht`;
  const phashQuery = `SELECT * FROM Hashes WHERE hashType LIKE :ht`;

  //run DB queries in parallel
  //1. get all hash records that exactly match sha256 (will find any identical images in db)
  //2. get all dhash records
  //3. get all phash records
  const [shaMatches, dhashes, phashes] = await Promise.all([
    db.sequelize.query(shaQuery, {
      replacements: { ht: 'sha256', hv: sha256 },
      type: db.sequelize.QueryTypes.SELECT
    }),
    db.sequelize.query(dhashQuery, {
      replacements: { ht: 'dhash' },
      type: db.sequelize.QueryTypes.SELECT
    }),
    db.sequelize.query(phashQuery, {
      replacements: { ht: 'phash' },
      type: db.sequelize.QueryTypes.SELECT
    })
  ]);

  const idSet = new Set();
  for (const match of shaMatches) {
    idSet.add(match.imageId);
    console.log(`DEBUG: Found exact SHA256 match - Image ID: ${match.imageId}`);
  }

  //compute hamming distances for dhash in parallel
  const dhashMatches = await Promise.all(dhashes.map(async (r) => {
    const hammingDist = await hammingDistance(dhash, r.hashValue);
    if (hammingDist <= hammingThreshold) {
      console.log(`DEBUG: Found fuzzy DHash match - Image ID: ${r.imageId}, Hamming Distance: ${hammingDist} (${r.hashValue})`);
      return { imageId: r.imageId, hammingDistance: hammingDist, type: 'dhash' };
    }
    return null;
  }));

  //compute hamming distances for phash in parallel
  const phashMatches = await Promise.all(phashes.map(async (r) => {
    const hammingDist = await hammingDistance(phash, r.hashValue);
    if (hammingDist <= hammingThreshold) {
      console.log(`DEBUG: Found fuzzy PHash match - Image ID: ${r.imageId}, Hamming Distance: ${hammingDist} (${r.hashValue})`);
      return { imageId: r.imageId, hammingDistance: hammingDist, type: 'phash' };
    }
    return null;
  }));

  const matchingHashes = [...dhashMatches, ...phashMatches].filter(Boolean);
  console.log("DEBUG: matchingHashes combined:", matchingHashes);

  //add matched ids and fetch images
  for (const m of matchingHashes) idSet.add(m.imageId);
  const finalIds = Array.from(idSet);
  console.log("DEBUG: final matched image IDs:", finalIds);

  const resultImages = await Images.findAll({
    where: { id: finalIds },
    include: [{ model: Hashes, as: 'hashes' }]
  });

  return resultImages.slice(0, limit);
}


module.exports = { findPhashMatchesBrute, hammingDistance, findMatchesMultiHash };