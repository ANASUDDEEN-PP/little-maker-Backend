const express = require("express");
const router = express.Router();
const productController = require("../Controllers/productController")

router.post('/create', productController.createProduct);
router.get('/get/collection/product/:id', productController.getProductOrderedByCollection);
router.get('/get/all', productController.getAllProducts);
router.get('/get/:id', productController.getProductById);
router.post('/post/product', productController.postComments);
router.get('/get/product/comments/:id', productController.getComments);
router.get('/get/random/product', productController.getRandomSixProduct);
router.put('/change/image/:id', productController.changeProductImage);
router.get('/get/flash/sale', productController.getProductsOrderedByFlashSale)

module.exports = router;




// /product/get/all