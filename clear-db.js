const mongoose = require("mongoose");

const dbUri = "mongodb://127.0.0.1:27017/apna_ecommerce";

// Import all models
const models = [
  require("./Models/AddressModel"),
  require("./Models/ImageModel"),
  require("./Models/OTPModel"),
  require("./Models/addToChart"),
  require("./Models/attachmentModel"),
  require("./Models/bannerModel"),
  require("./Models/brandModel"),
  require("./Models/collectionModel"),
  require("./Models/commentsModel"),
  require("./Models/gPayPaymentModel"),
  require("./Models/notificationModel"),
  require("./Models/orderModel"),
  require("./Models/productModel"),
  require("./Models/profileModel"),
  require("./Models/reviewModel"),
  require("./Models/socialModel"),
  require("./Models/stickerModel"),
  require("./Models/userCacheModel"),
  require("./Models/userModel"),
  require("./Models/wishlistModel")
];

async function clear() {
  await mongoose.connect(dbUri);
  console.log("Connected to DB to clear all data.");

  for (const model of models) {
    const modelName = model.modelName || model.displayName || "Unknown Model";
    try {
      const result = await model.deleteMany({});
      console.log(`Cleared collection for model: ${modelName} (Deleted: ${result.deletedCount})`);
    } catch (err) {
      console.error(`Error clearing collection for model ${modelName}:`, err.message);
    }
  }

  console.log("All collections cleared successfully!");
  await mongoose.disconnect();
}

clear().catch(console.error);
