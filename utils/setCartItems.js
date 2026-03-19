const cartModel = require("../Models/addToChart");
const wishlistModel = require("../Models/wishlistModel");

const setCartItems = async (localType, data = [], userId) => {
  try {
      if (!Array.isArray(data) || !userId) return;

    if (localType === "cart") {
      const items = data.map((item) => ({
        UserId: userId,
        Date: item.date,
        Item: item.itemId,
        Qty: item.quantity,
      }));

      await cartModel.insertMany(items);
    } else if(localType === "fav"){
      const items = data.map((item) => ({
        UserId: userId,
        Date: item.date,
        Item: item.itemId
      }));
      
      await wishlistModel.insertMany(items)
    }
  } catch (error) {
    console.error("Error while setting cart items:", error);
    throw error;
  }
};

module.exports = setCartItems;
