const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stickerSchema = new Schema({
  ordId: { type: String },
  name: { type: String },
  length: { type: String },
  text: { type: String },
  font: { type: String },
  customizedAt: { type: String }
});

module.exports = mongoose.model('sticker', stickerSchema);
