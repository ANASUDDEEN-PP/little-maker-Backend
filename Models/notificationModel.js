const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const notificationSchema = new Schema ({
    Title : {
        type : String
    },
    Content : {
        type : String
    },
    Category : {
        type : String
    },
    createdDate : {
        type : String
    },
    MarkAsRead : {
        type : String
    }
});

module.exports = mongoose.model('Notify', notificationSchema);