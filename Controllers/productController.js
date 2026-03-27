const productModel = require("../Models/productModel");
const imageModel = require("../Models/ImageModel");
const collectionModel = require("../Models/collectionModel");
const commentModel = require("../Models/commentsModel");
const attachModel = require("../Models/attachmentModel");
const sendNotify = require("../utils/sendNotify");
const brandModel = require("../Models/brandModel");

exports.createProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      collection,
      normalPrice,
      offerPrice,
      quantity,
      material,
      size,
      images,
      actualPrice,
      isFlashSale,
      brand,
      isTrending,
    } = req.body;

    // Validation
    if (!productName || !collection || !normalPrice || !quantity) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    // Generate Product ID
    const year = new Date().getFullYear();
    let productId = "";
    const productCount = await productModel.countDocuments();

    if (productCount === 0) {
      productId = `TLM/${year}/PRD/0001`;
    } else {
      const lastPrd = await productModel.findOne().sort({ _id: -1 });
      const lastPrdId = lastPrd.ProductId?.split("/").pop();
      const nextId = String(parseInt(lastPrdId) + 1).padStart(4, "0");
      productId = `TLM/${year}/PRD/${nextId}`;
    }

    // Create Product
    const productData = {
      ProductId: productId,
      Description: description,
      ProductName: productName,
      CollectionName: collection,
      ActualPrice: actualPrice,
      NormalPrice: parseFloat(normalPrice),
      OfferPrice: offerPrice ? parseFloat(offerPrice) : null,
      Quantity: parseInt(quantity),
      Material: material || null,
      Size: size || null,
      brand,
      flashSale: isFlashSale,
      trending: isTrending,
      rating: "0.0",
    };

    const product = await productModel.create(productData);

    // Store base64 images directly in imageModel
    const imageDocs = images.map((img) => ({
      imageId: product._id.toString(),
      from: "PRDIMG",
      ImageUrl: img, // directly store the base64 string or data:image/... URL
    }));

    await imageModel.insertMany(imageDocs);
    sendNotify(
      {
        productId: productData.ProductId,
        productName: productData.ProductName,
        Qty: productData.Quantity,
        Price: product.OfferPrice,
      },
      "PRDAD"
    );

    return res.status(201).json({
      message: "Product created successfully",
      productId: product.ProductId,
      images: images,
    });
  } catch (err) {
    console.error("Error creating product:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

exports.getAllProductToAdmin = async (req, res) => {
  try {
    const products = await productModel.find({}).lean();
    const collection = await collectionModel.find({}).lean();
    const brands = await brandModel.find({}).lean();

    const productList = products.map((prd) => {
      const collectionName = collection.find(
        (collct) => collct._id?.toString() === prd.CollectionName?.toString()
      );

      const brandName = brands.find(
        (brd) => brd._id?.toString() === prd.brand?.toString()
      )

      return {
        _id: prd._id,
        ProductId: prd.ProductId,
        ProductName: prd.ProductName,
        collectionName: collectionName.CollectionName,
        Quantity: prd.Quantity,
        brand: brandName.name || ""
      };
    });
    return res.status(200).json({
      productList,
    });
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productModel.aggregate([{ $sample: { size: 15 } }]);

    const images = await imageModel.find({}).lean();
    const brandData = await brandModel.find({}).lean();

    const allProducts = products.map((prd) => {
      const image = images.find((img) => img.imageId === prd._id.toString());
      const individualCollection = brandData.find(
        (brd) => brd._id?.toString() === prd.brand?.toString()
      );
      return {
        id: prd._id,
        productName: prd.ProductName,
        collection: individualCollection.name,
        normalPrice: prd.NormalPrice,
        offerPrice: prd.OfferPrice,
        rating: prd.rating,
        image: image ? image.ImageUrl : null,
        brand: individualCollection._id,
        Material: prd.Material
      };
    });

    return res.status(200).json({ allProducts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(404).json({ message: "Invalid Id or No Id" });
    const product = await productModel.findById(id);
    const images = await imageModel.find({ imageId: product._id });
    const productCollection = await collectionModel.findById({
      _id: product.CollectionName,
    });
    const productBrand = await brandModel.findById({
      _id: product.brand
    })

    const productList = {
      _id: product._id,
      ProductId: product.ProductId,
      ProductName: product.ProductName,
      Description: product.Description,
      CollectionName: productCollection.CollectionName,
      ActualPrice: product.ActualPrice,
      NormalPrice: product.NormalPrice,
      OfferPrice: product.OfferPrice,
      Quantity: product.Quantity,
      Material: product.Material,
      Size: product.Size,
      rating: product.rating,
      brand: productBrand.name
    };
    return res.status(200).json({
      productList,
      images,
    });
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }
};

exports.postComments = async (req, res) => {
  try {
    // console.log(req.body);
    const { Avatar, Comment, ProductId, Rating, UserId, Date, Attachments } =
      req.body;

    // Validate required fields
    if (!UserId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!Comment || Comment.trim().length === 0) {
      return res.status(201).json({
        success: false,
        message: "Comment text is required",
      });
    }

    if (!ProductId) {
      return res.status(401).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Validate rating (1-5)
    const validatedRating = Math.min(Math.max(Number(Rating) || 0, 1), 5);

    // Create comment data with current timestamp
    const commentsData = {
      ProductId,
      UserId,
      Rating: validatedRating,
      Likes: 0, // Initialize likes to 0
      Date, // Use current timestamp
      Comment: Comment.trim(),
      Avatar:
        Avatar ||
        '',
    };

    // Save to database 
    const newComment = await commentModel.create(commentsData);

    const attachmentsArray = Array.isArray(Attachments)
      ? Attachments
      : [Attachments];

    const attachDocs = attachmentsArray.map((url) => ({
      commentId: newComment._id,
      url,
    }));

    await attachModel.insertMany(attachDocs);

    const productData = await productModel.findById({
      _id: commentsData.ProductId,
    });
    sendNotify({ UserId, productName: productData.ProductId }, "CMTPST");

    return res.status(200).json({
      success: true,
      message: "Comment posted successfully",
      comment: {
        id: newComment._id,
        UserId: newComment.UserId,
        Rating: newComment.Rating,
        Comment: newComment.Comment,
        Date: newComment.Date,
        Avatar: newComment.Avatar,
      },
    });
  } catch (err) {
    console.error("Error posting comment:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const productExists = await productModel.findById(id);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    const comments = await commentModel
      .find({ ProductId: id })
      .sort({ Date: -1 })
      .lean();

    const attachments = await attachModel.find({}).lean();

    // Group attachments by commentId
    const attachmentMap = attachments.reduce((acc, item) => {
      const key = item.commentId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    const filteredComment = comments.map((cmt) => ({
      ProductId: cmt.ProductId,
      UserId: cmt.UserId,
      Rating: cmt.Rating,
      Likes: cmt.Likes || 0,
      Date: cmt.Date,
      Comment: cmt.Comment,
      attachment: attachmentMap[cmt._id.toString()] || [], // ✅ always array
      Avatar: cmt.Avatar || "",
    }));

    return res.status(200).json({ filteredComment });
  } catch (err) {
    console.error("Error fetching comments:", err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.getRandomSixProduct = async (req, res) => {
  try {
    const products = await productModel.aggregate([{ $sample: { size: 6 } }]);

    const productIds = products.map((p) => p._id);

    const images = await imageModel.find(
      { imageId: { $in: productIds } },
      { imageId: 1, ImageUrl: 1 }
    );

    const response = {
      products: products.map((prd) => {
        const productImage = images.find(
          (img) => img.imageId.toString() === prd._id.toString()
        );

        return {
          ...prd,
          imageUrl: productImage?.ImageUrl || null,
        };
      }),
    };

    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// exports.getAllProducts = async (req, res) => {
//   try {
//     const products = await productModel.find({});
//     const productIds = products.map(p => p._id);

//     const images = await imageModel.find(
//       { imageId: { $in: productIds } },
//       { imageId: 1, ImageUrl: 1 }
//     );

//     const response = {
//       products: products.map(prd => {
//         const productImage = images.find(img =>
//           img.imageId.toString() === prd._id.toString()
//         );

//         return {
//           ...prd.toObject(),
//           imageUrl: productImage?.ImageUrl || null
//         };
//       })
//     };

//     return res.status(200).json(response);
//   } catch (err) {
//     return res.status(500).json({
//       message: "Internal Server Error",
//       error: err.message
//     });
//   }
// };

exports.changeProductImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!(await productModel.findById(id)))
      return res.status(404).json({ message: "NoInvalidId" });

    const imageData = {
      imageId: id,
      from: "PRDIMG",
      ImageUrl: req.body.imageURL,
    };
    await imageModel.create(imageData);
    return res.status(200).json({
      message: "Image Updated...",
    });
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }
};

exports.getProductsOrderedByFlashSale = async (req, res) => {
  try {
    const flashSale = await productModel.find({ flashSale: "true" }).lean();
    const productImage = await imageModel.find({}).lean();
    const brands = await brandModel.find({}).lean();

    const flashProducts = flashSale.map((flsh) => {
      // Pick the first matching image for this product
      const image = productImage.find(
        (img) => img.imageId === flsh._id.toString()
      );

      const brand = brands.find(
        (brd) => brd?._id.toString() === flsh?.brand.toString()
      )

      return {
        id: flsh._id,
        productName: flsh.ProductName,
        collection: brand.name || "",
        normalPrice: flsh.NormalPrice,
        offerPrice: flsh.OfferPrice,
        rating: flsh.rating,
        image: image ? image.ImageUrl : null,
      };
    });

    return res.status(200).json({
      flashProducts,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.getTrendingProducts = async (req, res) => {
  try {
    const products = await productModel.find({ trending: true }).lean();
    const images = await imageModel.find({}).lean();
    const brands = await brandModel.find({}).lean();

    const trendProducts = products.map((prd) => {
      const image = images.find((img) => img.imageId === prd._id.toString());
      const brand = brands.find((brd) => brd?._id.toString() === prd?.brand.toString())

      return {
        id: prd._id,
        productName: prd.ProductName,
        collection: brand.name || "",
        normalPrice: prd.NormalPrice,
        offerPrice: prd.OfferPrice,
        rating: prd.rating,
        image: image ? image.ImageUrl : null, // only one image
      };
    });

    return res.status(200).json({ trendProducts });
  } catch (err) {
    console.error("Error fetching trending products:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteProducts = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(404).json({ message: "ID is Required" });

    const product = await productModel.findById(id);
    if (!product)
      return res.status(404).json({ message: "No Product Available" });

    await productModel.findByIdAndDelete(id);
    return res.status(200).json({
      message: "Product Deleted Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ProductName,
      Description,
      CollectionName,
      OfferPrice,
      NormalPrice,
      ActualPrice,
      Quantity,
      Material,
      Size,
    } = req.body;

    if (!id) return res.status(404).json({ message: "ID is Required" });

    const updatedproduct = {
      ProductName,
      Description,
      CollectionName,
      ActualPrice,
      NormalPrice,
      OfferPrice,
      Quantity,
      Material,
      Size,
    };

    await productModel.findByIdAndUpdate(
      { _id: id },
      { $set: updatedproduct },
      { new: true }
    );

    return res.status(200).json({
      message: "Product Updated Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};


exports.getAllBrandsProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    if(!id)
      return res.status(404).json({message: "Invalid ID"});

    const products = await productModel.find({ brand: id });
    const images = await imageModel.find({}).lean();
    const brandData = await brandModel.findById(id);

    const allProducts = products.map((prd) => {
      const image = images.find((img) => img.imageId === prd._id.toString());
      
      return {
        id: prd._id,
        productName: prd.ProductName,
        collection: brandData.name,
        normalPrice: prd.NormalPrice,
        offerPrice: prd.OfferPrice,
        rating: prd.rating,
        image: image ? image.ImageUrl : null,
        brand: brandData.name || "",
        Material: prd.Material
      };
    });

    return res.status(200).json({
      allProducts,
      collection: brandData.name || ""
    })
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};