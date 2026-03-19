const express = require("express");
const router = express.Router();
const productController = require("../Controllers/productController")

router.post('/create', productController.createProduct);
router.get('/get/all', productController.getAllProducts);
router.get('/admin/get/all/products', productController.getAllProductToAdmin)
router.get('/get/:id', productController.getProductById);
router.post('/post/comment', productController.postComments);
router.get('/get/product/comments/:id', productController.getComments);
router.get('/get/random/product', productController.getRandomSixProduct);
router.put('/change/image/:id', productController.changeProductImage);
router.get('/get/flash/sale', productController.getProductsOrderedByFlashSale)
router.get('/get/trending/products', productController.getTrendingProducts);
router.delete('/delete/:id', productController.deleteProducts);
router.put('/update/:id', productController.updateProduct)


module.exports = router;




// /product/admin/get/all/products