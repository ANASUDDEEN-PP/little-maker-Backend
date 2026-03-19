const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const attachmentSchema = new Schema({
    commentId : {
        type : String
    },
    url : {
        type : String
    },
});

module.exports = mongoose.model('attachments', attachmentSchema);