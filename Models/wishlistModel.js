const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const cartSchema = new Schema ({
    UserId : {
        type : String
    },
    Date : {
        type : String
    },
    Item : {
        type : String
    },
});
module.exports = mongoose.model('wishlist', cartSchema);