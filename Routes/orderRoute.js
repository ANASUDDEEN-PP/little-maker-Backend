const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/orderController");
const razorPayController = require("../Controllers/onlinePaymentController")

router.post('/add', orderController.addOrder);
router.post('/gpay/payment/details', orderController.googlePayPaymentDetails);
router.get('/get/all/orders', orderController.getAllOrders);
router.get('/get/order/:id', orderController.getOrderById);
router.put('/edit/:id', orderController.orderEditByAdmin);
router.get('/user/get/:id', orderController.orderDetailsById);
router.put('/user/cancel/:id', orderController.userCancelOrder);
router.get('/get/invoice/data/:id', orderController.invoiceData);
router.get('/get/stickers/data/:id', orderController.getStickerData);

//Razorpay Integration
router.post("/razorpay/create-order", razorPayController.createRazorpayOrder);
router.post("/razorpay/verify-payment", razorPayController.verifyRazorpayPayment);

module.exports = router;

// /order/