const express = require("express");
const router = express.Router();

//Import Controller
const addressController = require("../Controllers/addressController");

router.post('/add', addressController.addAddress);
router.get('/get/:id', addressController.getAddressByUserId);
router.get('/get/address/order/:id', addressController.getAddressByIdOrder);
router.delete('/delete/:id', addressController.deleteAddress)

module.exports = router;