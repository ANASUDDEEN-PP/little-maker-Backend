const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
    userId : {
        type : String,
        required : true
    },
    Name : {
        type : String
    },
    Mobile : {
        type : String
    },
    isMobileVerified : {
        type: String
    },
    Email : {
        type : String
    },
    isEmailVerified: {
        type: String
    },
    Password : {
        type : String
    }
});

module.exports = mongoose.model('users', userSchema);