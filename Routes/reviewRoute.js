const express = require("express");
const router = express.Router();

//Import Controller
const reviewController = require("../Controllers/reviewController");

router.post('/post/:id', reviewController.addReview);
router.get('/fetch/all', reviewController.getAllReviewToAdmin);
router.put('/update/air/:id', reviewController.updateAir);
router.get('/fetch/user', reviewController.getOnAirReviews);
router.get('/user/liked/:id', reviewController.fetchLikedOrNot);
router.post('/user/liked', reviewController.clikedLikeFunction);



module.exports = router;