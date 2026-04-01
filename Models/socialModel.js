const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const socialScheme = new Schema({
  file: { type: String },
  path: { type: String },
  caption: { type: String },
  onAir: { type: Boolean },
  date: { type: String}
});

module.exports = mongoose.model('socialmedia', socialScheme);
