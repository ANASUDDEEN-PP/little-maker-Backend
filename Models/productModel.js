const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const productSchema = new Schema({
    ProductId : {
        type : String
    },
    ProductName : {
        type : String
    },
    Description : {
        type : String
    },
    CollectionName : {
        type : String
    },
    ActualPrice: {
        type: String
    },
    NormalPrice : {
        type : String
    },
    OfferPrice : {
        type : String
    },
    Quantity : {
        type : String
    },
    Material : {
        type : String
    },
    Size : {
        type: String
    },
    flashSale: {
        type: String
    },
    trending : {
        type: String
    },
    rating: {
        type: String
    }
});

module.exports = mongoose.model('products', productSchema);