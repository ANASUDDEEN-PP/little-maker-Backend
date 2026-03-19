const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stickerSchema = new Schema({
  productId: { type: String },
  width: { type: String },
  height: { type: String },
  unit: { type: String },
  text: { type: String },
  font: { type: String },
  textColor: { type: String },
  textSize: { type: String },
  textPosition: { type: String },
  imagePreview: { type: String },
  imageSize: { type: String },
  imagePosition: { type: String },
  contentType: { type: String },
  randomStickerId: { type: String },
  localUser: { type: String },
});

module.exports = mongoose.model('sticker', stickerSchema);
