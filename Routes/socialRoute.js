const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");

//Import Controller
const socialController = require("../Controllers/socialController");

router.post('/upload', upload.array("images"), socialController.socailMediaPostUpload);
router.put('/update/:id', socialController.updateAir);
router.get('/fetch/all', socialController.getAllSocial);
router.delete('/delete/:id', socialController.deletePost);
router.get('/fetch/onAir', socialController.fetchAirPost);


module.exports = router;