const productModel = require("../Models/productModel");
const imageModel = require("../Models/ImageModel");
const userModel = require("../Models/userModel");
const wishlistModel = require("../Models/wishlistModel");

exports.getUnAuthoroziedWishlist = async (req, res) => {
  try {
    const { wishlist } = req.body;
    // console.log(wishlist);

    if (!wishlist)
      return res.status(404).json({ message: "Item id is required" });

    const products = await productModel.find({}).lean();
    const images = await imageModel.find({}).lean();

    const mergedWishlist = wishlist.map((wishlst) => {
      const product = products.find(
        (prd) => prd._id?.toString() === wishlst.itemId?.toString()
      );
      const image = images.find(
        (img) => img.imageId?.toString() === wishlst.itemId?.toString()
      );
      return {
        wishlistId: "",
        _id: product?._id,
        name: product?.ProductName,
        image: image?.ImageUrl || null,
        price: product?.OfferPrice || 0,
        instock: product?.Quantity,
      };
    });

    return res.status(200).json({
      mergedWishlist,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.loggedUserWishlist = async (req, res) => {
  try {
    const { UserId, Date, Item } = req.body;

    if (!UserId || !Item) {
      return res.status(400).json({
        message: "UserId and Item are required",
      });
    }

    const userExists = await userModel.exists({ _id: UserId });
    if (!userExists) {
      return res.status(404).json({ message: "Invalid User Id" });
    }

    // ✅ Check wishlist for THIS USER + THIS ITEM
    const isFavExist = await wishlistModel.findOne({
      UserId,
      Item,
    });

    // 🔁 Toggle remove
    if (isFavExist) {
      await wishlistModel.deleteOne({ _id: isFavExist._id });

      return res.status(200).json({
        message: "Product removed from wishlist",
        isStatus: false,
      });
    }

    // ➕ Add to wishlist
    await wishlistModel.create({
      UserId,
      Item,
      Date: Date || Date.now(),
    });

    return res.status(200).json({
      message: "Product added to wishlist",
      isStatus: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.getAuthorizedWishlist = async (req, res) => {
  try {
    const { id } = req.params;

    const userExists = await userModel.findById(id);
    if (!userExists)
      return res.status(404).json({ message: "Invalid User Id" });

    const wishList = await wishlistModel.find({ UserId: id }).lean();
    if (!wishList)
      return res.status(404).json({ message: "Item id is required" });

    const products = await productModel.find({}).lean();
    const images = await imageModel.find({}).lean();

    const mergedWishlist = wishList.map((wishlst) => {
      const product = products.find(
        (prd) => prd._id?.toString() === wishlst.Item?.toString()
      );
      const image = images.find(
        (img) => img.imageId?.toString() === wishlst.Item?.toString()
      );
      return {
        _id: product?._id,
        name: product?.ProductName,
        image: image?.ImageUrl || null,
        price: product?.OfferPrice || 0,
        instock: product?.Quantity,
      };
    });

    return res.status(200).json({
      mergedWishlist,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.checkStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(404).json({ message: "Invalid ID" });

    const checkStatus = await wishlistModel.findOne({ Item: id });
    if (!checkStatus) return res.status(200).json({ isStatus: false });
    return res.status(201).json({ isStatus: true });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.deleteWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemId } = req.query;

    if (!id) return res.status(404).json({ message: "Invalid ID" });

    await wishlistModel.findOneAndDelete({UserId: id, Item: itemId});
    return res.status(200).json({
      message: "Product Deleted from the Favorite",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
