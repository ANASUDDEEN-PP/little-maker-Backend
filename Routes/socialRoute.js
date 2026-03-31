const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");

//Import Controller
const socialController = require("../Controllers/socialController");

router.post('/upload', upload.array("images"), socialController.socailMediaPostUpload);

module.exports = router;