const express = require("express");
const router = express.Router();
const wishlistController = require("../Controllers/wishlistController")

router.post('/get/local/data', wishlistController.getUnAuthoroziedWishlist);
router.post('/logged/create', wishlistController.loggedUserWishlist);
router.get('/get/user/:id', wishlistController.getAuthorizedWishlist);
router.get('/check/status/:id', wishlistController.checkStatus);
router.delete('/remove/:id', wishlistController.deleteWishlist)


module.exports = router;
