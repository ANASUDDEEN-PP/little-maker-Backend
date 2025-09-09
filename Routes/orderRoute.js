const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/orderController")

router.post('/add', orderController.addOrder);
router.post('/gpay/payment/details', orderController.googlePayPaymentDetails);
router.get('/get/all/orders', orderController.getAllOrders);
router.get('/get/order/:id', orderController.getOrderById);
router.put('/edit/:id', orderController.orderEditByAdmin);
router.get('/user/get/:id', orderController.orderDetailsById);
router.put('/user/cancel/:id', orderController.userCancelOrder)

module.exports = router;

// 