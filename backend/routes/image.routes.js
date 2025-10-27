module.exports = (app) => {
    const express = require('express');
    const router = express.Router();
    const images = require("../controllers/image.controller.js");
    const multer = require('multer');
    const storage = multer.memoryStorage();
    const upload = multer({ storage });

    router.get("/images", images.getAll);
    router.get("/images/:id", images.getOne);
    router.post("/images", images.create);
    router.post("/upload", upload.single('userImage'), images.uploadImage);

    app.use('/api', router);
};