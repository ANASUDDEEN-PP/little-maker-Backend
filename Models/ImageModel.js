const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const imageSchema = new Schema({
    imageId : {
        type: String
    },
    from : {
        type: String
    },
    ImageUrl : {
        type: String
    }
});

module.exports = mongoose.model('Images', imageSchema);