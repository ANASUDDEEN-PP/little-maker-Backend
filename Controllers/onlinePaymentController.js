const Razorpay = require("razorpay");
const crypto = require("crypto");
const orderModel= require("../Models/orderModel")

// ✅ initialize Razorpay instance
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, // store in .env
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn("⚠️ Razorpay credentials (RAZORPAY_KEY_ID and/or RAZORPAY_KEY_SECRET) are missing. Razorpay payment integration is disabled.");
}

// ==============================
// Create Razorpay order
// ==============================
exports.createRazorpayOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(400).json({ error: "Razorpay is not configured on this server." });
    }
    const { amount, currency, receipt } = req.body;

    if (!amount || !currency || !receipt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const options = {
      amount: amount, // amount in paise
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);

    res.json(order); // send Razorpay order response to frontend
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
};

// ==============================
// Verify Razorpay payment
// ==============================
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId, // your own orderId from DB
    } = req.body;

    console.log(req.body)

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(400).json({ success: false, message: "Razorpay secret key is not configured on this server." });
    }

    await orderModel.findOneAndUpdate(
        { orderID: orderId },
        { $set:{
            isComplete: true,
            paymentID: razorpay_payment_id,
            razorPayOrderId: razorpay_payment_id
        }},
        {new : true}
    )

    // Generate signature (HMAC SHA256)
    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (sign === razorpay_signature) {
      // ✅ Signature valid
      // Update order status in DB here (e.g., mark as "Paid")
      return res.json({ success: true, message: "Payment verified", orderId });
    } else {
      // ❌ Invalid signature
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }
  } catch (err) {
    console.error("Error verifying Razorpay payment:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
