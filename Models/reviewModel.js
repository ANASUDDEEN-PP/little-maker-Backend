const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const reviewSchema = new Schema({
    rating : {
        type: String
    },
    description : {
        type: String
    },
    likes : {
        type: String
    },
    onAir : {
        type: Boolean
    },
    user: {
        type: String
    },
    createdAt: {
        type: String
    },
    orderId: {
        type: String
    },
    likedUsers: {
        type: Object
    }
});

module.exports = mongoose.model('review', reviewSchema);