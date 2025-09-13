const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const orderSchema = new Schema({
    orderID : {
        type: String
    },
    productId : {
        type : String
    },
    customerId : {
        type :String
    },
    paymentType : {
        type : String
    },
    addressId : {
        type : String
    },
    paymentStatus : {
        type : String
    },
    orderStatus : {
        type: String
    },
    orderDate : {
        type : String
    },
    deliveredDate : {
        type: String
    },
    trackId : {
        type: String
    },
    size : {
        type : String
    },
    qty : {
        type: String
    },
    isComplete: {
        type: String
    },
    cancellationReason : {
        type: String
    },
    paymentID: {
        type: String
    },
    razorPayOrderId: {
        type: String
    }
});

module.exports = mongoose.model('orders', orderSchema);