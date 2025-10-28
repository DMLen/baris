const db = require("../models");
const Images = db.images;
const Hashes = db.hashes;
const Op = db.Sequelize.Op;
const phash = require("sharp-phash");
const dist = require("sharp-phash/distance");

const { getImageBuffer, getDimensions, saveThumb, generatePhash, generateHash } = require('../funcs/imageFunctions');
const { findPhashMatchesBrute, findMatchesMultiHash } = require('../funcs/searchFunctions');

//these controller functions relate to searching for images based on hashes
exports.searchByPhashBrute = async (req, res) => {
    const inputPhash = req.params?.phash || req.body?.phash || req.query?.phash;
    const threshold = parseInt(req.body?.threshold || req.query?.threshold || 5, 10);
    const limit = parseInt(req.body?.limit || req.query?.limit || 10, 10);

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

exports.searchByHashMulti = async (req, res) => {
    const sha256 = req.query?.sha256;
    const dhash = req.query?.dhash;
    const phash = req.query?.phash;
    const hammingThreshold = parseInt(req.query?.hammingThreshold || 10);
    const limit = parseInt(req.query?.limit || 10);

    if (!sha256 || !dhash || !phash) {
        return res.status(400).send({ error: "Hash data is required" });
    }

    try {
        const results = await findMatchesMultiHash(sha256, dhash, phash, hammingThreshold, limit);
        res.send(results);
    } catch (error) {
        console.error("Error searching for images:", error);
        res.status(500).send("Internal Server Error");
    }
};
