const brandModel = require("../Models/brandModel");
const productModel = require("../Models/productModel");
const imageModel = require("../Models/ImageModel");

exports.createBrand = async (req, res) => {
  try {
    const { name, date, image, imageName } = req.body;
    await brandModel.create({
      name,
      date,
      image,
      imageName,
    });
    return res.status(200).json({
      message: `${name} brand is Created Successfully`,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      err,
    });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const brand = await brandModel.find({}).lean();
    return res.status(200).json({
      brand,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server error",
      err,
    });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, image, imageName } = req.body;

    if (!id || !(await brandModel.findById(id)))
      return res.status(202).json({ message: "Invalid Id" });

    await brandModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name,
          date,
          image,
          imageName,
        },
      },
      { new: true }
    );
    return res.status(200).json({
      message: "Brand Updated...",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server error",
      err,
    });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !(await brandModel.findById(id)))
      return res.status(202).json({ message: "Invalid Id" });

    await brandModel.findByIdAndDelete(id);
    return res.status(200).json({
      message: "Brand Deleted....",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server error",
      err,
    });
  }
};

exports.getProductOrderedByBrand = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the collection
    const brand = await brandModel.findById(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    // 2. Find products in this collection
    const products = await productModel.find({
      brand: brand._id,
    });

    // 3. Get images for all products
    const productIds = products.map((p) => p._id);
    const images = await imageModel.find({
      imageId: { $in: productIds },
    });

    // 4. Structure the response (using string comparison)
    const response = {
      brandName: brand.name,
      products: products.map((product) => {
        return {
          ...product.toObject(),
          images: images.filter(
            (img) => img.imageId.toString() === product._id.toString()
          ),
        };
      }),
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error("Error in getProductOrderedByCollection:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

exports.getFilteredBrand = async (req, res) => {
  try {
    const brands = await brandModel.find({}).lean();

    const filteredBrand = brands.map((brand) => ({
      id: brand._id,
      name: brand.name,
    }));

    return res.status(200).json({
      filteredBrand,
    });
  } catch (err) {
    console.error("Error in getFilteredBrand:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

exports.getBrandsToBanner = async (req, res) => {
  try {
    const brand = await brandModel.find({}).lean();
    const filterBrand = brand.map((brd) => {
      return {
        _id: brd._id || "",
        name : brd.name || ""
      }
    })
    return res.status(200).json({
      filterBrand
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server error",
      err,
    });
  }
};
