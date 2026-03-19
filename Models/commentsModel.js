const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const commentSchema = new Schema({
    ProductId : {
        type: String
    },
    UserId : {
        type: String
    },
    Rating : {
        type: String
    },
    Likes : {
        type: String
    },
    Date : {
        type: String
    },
    Comment : {
        type: String
    },
    attachment: {
        type: String
    },
    Avatar : {
        type: String
    }
});

module.exports = mongoose.model('comments', commentSchema);