const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const collectionSchema = new Schema({
    CollectionName : {
        type : String
    },
    CreatedData : {
        type : String
    },
    File : {
        type : String
    }
});

module.exports = mongoose.model('collection', collectionSchema);