require('dotenv').config();
const mongoose = require('mongoose');

module.exports = () => {
  try {
    const dbUri = process.env.MONGOOSE_ATLAS_CONNECTION || "mongodb://127.0.0.1:27017/apna_ecommerce";
    if (!process.env.MONGOOSE_ATLAS_CONNECTION) {
      console.warn("⚠️ MONGOOSE_ATLAS_CONNECTION is not set in environment variables. Falling back to local MongoDB: mongodb://127.0.0.1:27017/apna_ecommerce");
    }

    mongoose.connect(dbUri);

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
