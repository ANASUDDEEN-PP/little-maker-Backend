const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const brandSchema = new Schema({
    name: {
        type: String
    },
    date: {
        type: String
    },
    image: {
        type: String
    },
    imageName: {
        type: String
    }
});

module.exports = mongoose.model('brand', brandSchema);