require('dotenv').config();
const mongoose = require('mongoose');

module.exports = () => {
  try {
    mongoose.connect(process.env.MONGOOSE_ATLAS_CONNECTION);

    mongoose.connection.on('connected', () => {
      console.log('✅ Connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });
  } catch (err) {
    console.log(`❌ Initial Connection Error: ${err}`);
  }
};
