const express = require("express");
const router = express.Router();

//Import Controller
const brandController = require("../Controllers/brandController");

router.post('/create', brandController.createBrand);
router.get('/get/all', brandController.getBrands);
router.put('/update/:id', brandController.updateBrand)
router.delete('/delete/:id', brandController.deleteBrand);
router.get('/get/products/:id', brandController.getProductOrderedByBrand);
router.get('/get/filter/brand', brandController.getFilteredBrand);
router.get('/get/name/all', brandController.getBrandsToBanner);

module.exports = router;