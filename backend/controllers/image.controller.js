const db = require("../models");
const Images = db.images;
const Hashes = db.hashes;
const Op = db.Sequelize.Op;

const { getImageBuffer, getDimensions, saveThumb, generatePhash, generateHash } = require('../funcs/imageFunctions');

//these controller functions relate to indexing new image records and retrieving them as well

//index new image
exports.create = async (req, res) => {
  const image = {
    origin: req.body.origin,
  };
  console.log("DEBUG: Creating new image record:", image);

  try {
    //image data
    const imageBuffer = await getImageBuffer(image.origin); //download image to buffer
    const dimensions = await getDimensions(imageBuffer);
    const thumbPath = await saveThumb(imageBuffer);
    //hash data
    const phash = await generatePhash(imageBuffer);
    const sha256 = generateHash(imageBuffer);

    //set data fields for image record
    image.thumbnailPath = thumbPath;
    image.width = dimensions.width;
    image.height = dimensions.height;

    //use transaction to create image record and associate it with hashes
    const createdImage = await db.sequelize.transaction(async (transaction) => {
      const created = await Images.create(image, { transaction });

      const hashValues = [
        { imageId: created.id, hashType: 'phash', hashValue: phash },
        { imageId: created.id, hashType: 'sha256', hashValue: sha256 }
      ];
      await Hashes.bulkCreate(hashValues, { transaction });

      return created;
    });

    res.send(createdImage);
  } catch (err) {
    console.error("Error creating image + hashes:", err);
    res.status(500).send({
      message: err.message || "Error encountered!"
    });
  }
};

//get all images
//tbh this probably shouldnt exist but i want it anyway
exports.getAll = (req, res) => {
  console.log("Retrieving all image records with hashes.");
  Images.findAll({ include: [{ model: Hashes, as: 'hashes' }] }) 
    .then(data => { res.send(data); })
    .catch(err => { console.error("Error retrieving images with hashes:", err); res.status(500).send({ message: err.message || "Error encountered!" }); });
};

//get image by id
exports.getOne = async (req, res) => {
  const id = req.params.id;
  console.log("Retrieving image record with ID", id);
  try {
    const image = await Images.findByPk(id, { include: [{ model: Hashes, as: 'hashes' }] });
    if (!image) {
      return res.status(404).send({ message: `Image with id ${id} not found.` });
    }
    res.json(image);
  } catch (err) {
    console.error("Error retrieving image with hashes:", err);
    res.status(500).send({ message: err.message || "Error encountered!" });
  }
};

//generate hash and return to browser for subsequent searches
exports.uploadImage = async (req, res) => {
console.log("DEBUG: Received image upload for hashing.");
try {
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded." });
    }
    const imageBuffer = req.file.buffer;
    const phash = await generatePhash(imageBuffer);
    const sha256 = await generateHash(imageBuffer);
    res.send({ phash, sha256 });
  } catch (err) {
    console.error("Error processing uploaded image:", err);
    res.status(500).send({ message: err.message || "Error encountered!" });
  }
};