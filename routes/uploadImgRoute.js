const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const path = require("path");
const Post = require('../schemas/PostSchema');

router.get("/images/:path", (req, res, next) => {
    res.sendFile(path.join(__dirname, `../uploads/postimg/${req.params.path}`));
})

module.exports = router;