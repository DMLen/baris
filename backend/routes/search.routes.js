module.exports = (app) => {
    const express = require('express');
    const router = express.Router();
    const search = require("../controllers/search.controller.js");

    router.get("/images/search/phash/:phash", search.searchByPhashBrute);

    app.use('/api', router);
};