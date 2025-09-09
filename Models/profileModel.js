const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const profileSchema = new Schema({
    userId : {
        type: String
    },
    from : {
        type: String
    },
    ImageUrl : {
        type: String
    }
});

module.exports = mongoose.model('profiles', profileSchema);