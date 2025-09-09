const express = require("express");
const router = express.Router();

//Import Controller
const AuthController = require("../Controllers/authController");

router.post('/register', AuthController.userRegister);
router.get('/get/all', AuthController.getAllUsers);
router.get('/get/user/:id', AuthController.getUserById);
router.post('/set/profile/img/:id', AuthController.setUserProfileImage);
router.get('/get/profile/image/:id', AuthController.getProfileImage);
router.put('/edit/profile/:id', AuthController.editUserProfileData);
router.post('/post/otp', AuthController.verifyOTP);
router.post('/resend/otp', AuthController.resendOTP);
router.post('/forget/otp/request', AuthController.forgetOTPRequest)
router.put('/change/password', AuthController.changePassword)

module.exports = router;