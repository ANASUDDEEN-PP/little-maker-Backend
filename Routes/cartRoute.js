const express = require("express");
const router = express.Router();
const cartController = require("../Controllers/cartController");

router.post('/add/item', cartController.addToCart);
router.get('/get/:id', cartController.getCartOfUser);
router.put('/qty/Increase/:id', cartController.editCartQty);
router.delete('/delete/:id', cartController.removeCartElements);

module.exports = router;