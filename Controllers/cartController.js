const cartModel = require("../Models/addToChart");
const userModel = require("../Models/userModel");
const productModel = require("../Models/productModel");
const imageModel = require("../Models/ImageModel");

const formatDate = require("../utils/dateFormat");

exports.addToCart = async (req, res) => {
  try {
    const { UserId, Quantity, itemsData, status } = req.body;

    // Validate user
    const user = await userModel.findById(UserId);
    if (!user) return res.status(404).json({ message: "InvalidUserID" });

    // Validate product
    const product = await productModel.findById(itemsData);
    if (!product) return res.status(404).json({ message: "InvalidProductID" });

    // Check if the product is already in the cart for the user
    const existingCartItem = await cartModel.findOne({ UserId, Item: itemsData });

    if (existingCartItem) {
      // Calculate new quantity based on status
      let newQty;
      if (status === "decrease") {
        newQty = parseInt(existingCartItem.Qty) - parseInt(Quantity);
        // Prevent quantity from going below 1
        if (newQty < 1) {
          await cartModel.findByIdAndDelete(existingCartItem._id);
          return res.status(200).json({ message: "Item removed from cart." });
        }
      } else {
        newQty = parseInt(existingCartItem.Qty) + parseInt(Quantity);
      }

      // Update cart item
      const updated = await cartModel.findByIdAndUpdate(
        existingCartItem._id,
        { $set: { Qty: newQty } },
        { new: true }
      );

      return res.status(200).json({
        message: "Cart item updated.",
        data: updated,
      });
    } else {
      // If not exists, create a new cart item
      const newCartItem = {
        UserId,
        Date: formatDate("NNMMYY|TT:TT"),
        Item: itemsData,
        Qty: Quantity,
      };

      const createdItem = await cartModel.create(newCartItem);

      return res.status(200).json({
        message: "Item added to cart.",
        data: createdItem,
      });
    }
  } catch (err) {
    console.error("Error in addToCart:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

exports.getCartOfUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userExists = await userModel.findById(id);
    if (!userExists) {
      return res.status(401).json({ message: "NoUserOnOurRecord" });
    }

    const cartItems = await cartModel.find({ UserId: id });
    if (!cartItems || cartItems.length === 0) {
      return res.status(200).json({ message: "No Products On Cart" });
    }

    const productIds = cartItems.map(i => i.Item);

    const products = await productModel.find({ _id: { $in: productIds } });
    const images = await imageModel.find({ imageId: { $in: productIds } });

    // Merge data into one response array
    const mergedCartData = cartItems.map((cartItem) => {
      const product = products.find(p => p._id.toString() === cartItem.Item.toString());
      const image = images.find(img => img.imageId.toString() === cartItem.Item.toString());

      return {
        cartId: cartItem._id,
        prdId: product?._id,
        prdName: product?.ProductName,
        prdImg: image?.ImageUrl || null,
        Qty: cartItem.Qty,
        price: product?.OfferPrice || 0,
      };
    });

    return res.status(200).json({
      cartItems: mergedCartData
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

exports.editCartQty = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, productId } = req.body;
        console.log(productId, action, id);

        const isCart = await cartModel.findById(id);
        console.log(isCart);
        if (!isCart)
            return res.status(401).json({ message: "InvalidId" });

        if (!await productModel.findById(productId))
            return res.status(401).json({ message: "NoProductHave" });

        const itemIndex = isCart.Items.findIndex(i => i.type.toString() === productId.toString());

        if (itemIndex !== -1) {
            if (action === 'increase') {
                isCart.Items[itemIndex].Qty += 1;
            } else if (action === 'decrease') {
                isCart.Items[itemIndex].Qty = Math.max(1, isCart.Items[itemIndex].Qty - 1);
            }
            await isCart.save();
            return res.status(200).json({ message: "Cart updated", cart: isCart });
        } else {
            return res.status(404).json({ message: "Item not found in cart" });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

exports.removeCartElements = async(req, res) => {
    try{
        const { id } = req.params;
        if(!await cartModel.findById(id))
            return res.status(404).json({ message : "InvalidID" });

        await cartModel.findByIdAndDelete(id);
        return res.status(200).json({
            message : "Product Removed From the Cart..."
        })
    } catch(err){
        return res.status(404).json({
            message : "Internal Server Error"
        })
    }
}

exports.getUnAuthoroziedCart = async(req, res) => {
  try{
    const { cart } = req.body;
    // console.log(cart)
    
    if(!cart)
      return res.status(404).json({ message : "Item id is required" });

    const products = await productModel.find({}).lean();
    const images = await imageModel.find({}).lean();

    const mergedCartData = cart.map((cartItem) => {
      const product = products.find((prd) => prd._id?.toString() === cartItem.itemId?.toString());
      const image = images.find((img) => img.imageId?.toString() === cartItem.itemId?.toString());
      return {
        cartId: "",
        prdId: product?._id,
        prdName: product?.ProductName,
        prdImg: image?.ImageUrl || null,
        Qty: cartItem?.quantity || 0,
        price: product?.OfferPrice || 0
      }
    });

    return res.status(200).json({
      cartItems: mergedCartData
    })
  } catch(err){
    return res.status(500).json({
      message : "Internal Server Error"
    })
  }
}