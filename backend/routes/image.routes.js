module.exports = (app) => {
    const express = require('express');
    const router = express.Router();
    const images = require("../controllers/image.controller.js");

    router.get("/images", images.getAll);
    router.get("/images/:id", images.getOne);
    router.post("/images", images.create);

    app.use('/api', router);
};