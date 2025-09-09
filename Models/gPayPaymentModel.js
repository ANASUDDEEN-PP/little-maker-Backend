const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const paymentDetailsSchema = new Schema({
    orderId : {
        type: String
    },
    screenshotBase64 : {
        type: String
    },
    screenshotName : {
        type: String
    },
    Date : {
        type: String
    }
});

module.exports = mongoose.model('paymentdetails', paymentDetailsSchema);