const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cacheSchema = new Schema({
  userId: { type: String },
  productId: { type: String },
  stickerId: { type: String },
});

module.exports = mongoose.model('cache', cacheSchema);
