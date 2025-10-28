module.exports = (app) => {
    const express = require('express');
    const router = express.Router();
    const search = require("../controllers/search.controller.js");

    router.get("/images/search/phash/:phash", search.searchByPhashBrute); //old phash-only route
    router.get("/images/search", search.searchByHashMulti); //GET http://localhost:5000/api/images/search?sha256=xxx&dhash=xxx&phash=xxx&threshold=5&limit=10

    app.use('/api', router);
};