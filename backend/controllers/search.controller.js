const db = require("../models");
const Images = db.images;
const Hashes = db.hashes;
const Op = db.Sequelize.Op;
const phash = require("sharp-phash");
const dist = require("sharp-phash/distance");

const { getImageBuffer, getDimensions, saveThumb, generatePhash, generateHash } = require('../funcs/imageFunctions');
const { findPhashMatchesBrute } = require('../funcs/searchFunctions');

//these controller functions relate to searching for images based on hashes
exports.searchByPhashBrute = async (req, res) => {
  const inputPhash = req.params?.phash || req.body?.phash || req.query?.phash;
  const threshold = req.body?.threshold || req.query?.threshold || 5;
  const limit = req.body?.limit || req.query?.limit || 10;

  if (!inputPhash) {
    return res.status(400).send({ error: "phash is required (use route param, body or query)" });
  }

  try {
    const results = await findPhashMatchesBrute(inputPhash, threshold, limit);
    res.send(results);
  } catch (error) {
    console.error("Error searching for images:", error);
    res.status(500).send("Internal Server Error");
  }
};
