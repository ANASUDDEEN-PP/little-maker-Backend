const express = require("express");
const router = express.Router();

//Import Controller
const bannerController = require("../Controllers/bannerController");

router.post('/create', bannerController.createBanner);
router.get('/fetch/all', bannerController.getBannerDetails);
router.delete('/delete/:id', bannerController.deleteBanner)

module.exports = router;