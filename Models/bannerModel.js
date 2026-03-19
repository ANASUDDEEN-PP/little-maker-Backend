const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bannerSchema = new Schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    url: {
        type: String
    },
    brandName: {
        type: String
    },
    backgroundColor: {
        type: String
    }
});

module.exports = mongoose.model('banner', bannerSchema);