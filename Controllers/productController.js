const productModel = require("../Models/productModel");
const imageModel = require("../Models/ImageModel");
const collectionModel = require("../Models/collectionModel");
const commentModel = require("../Models/commentsModel");
const sendNotify = require("../utils/sendNotify");

exports.createProduct = async (req, res) => {
  try {
    const { productName, description, collection, normalPrice, offerPrice, quantity, material, size, images, actualPrice,isFlashSale, isTrending } = req.body;

    // Validation
    if (!productName || !collection || !normalPrice || !quantity) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
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
      const nextId = String(parseInt(lastPrdId) + 1).padStart(4, '0');
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
      flashSale: isFlashSale,
      trending: isTrending,
      rating: "0.0"
    };

    const product = await productModel.create(productData);

    // Store base64 images directly in imageModel
    const imageDocs = images.map(img => ({
      imageId: product._id.toString(),
      from: 'PRDIMG',
      ImageUrl: img  // directly store the base64 string or data:image/... URL
    }));

    await imageModel.insertMany(imageDocs);
    sendNotify({
      productId: productData.ProductId,
      productName: productData.ProductName,
      Qty: productData.Quantity,
      Price: product.OfferPrice
    }, 'PRDAD');

    return res.status(201).json({
      message: "Product created successfully",
      productId: product.ProductId,
      images: images
    });

  } catch (err) {
    console.error("Error creating product:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getProductOrderedByCollection = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the collection
    const collection = await collectionModel.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // 2. Find products in this collection
    const products = await productModel.find({
      CollectionName: collection.CollectionName
    });

    // 3. Get images for all products
    const productIds = products.map(p => p._id);
    const images = await imageModel.find({
      imageId: { $in: productIds }
    });

    // 4. Structure the response (using string comparison)
    const response = {
      collection: collection.CollectionName,
      products: products.map(product => {
        return {
          ...product.toObject(),
          images: images.filter(img =>
            img.imageId.toString() === product._id.toString()
          )
        };
      })
    };

    return res.status(200).json(response);

  } catch (err) {
    console.error("Error in getProductOrderedByCollection:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  }
}

exports.getAllProductToAdmin = async(req, res) => {
  try{
    const products = await productModel.find({}).lean();
    return res.status(200).json({
      products
    })
  } catch(err){
    return res.status(404).json({
      message : "Internal Server Error"
    })
  }
}

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productModel.aggregate([{ $sample: { size: 15 } }]);

    const images = await imageModel.find({}).lean();

    const allProducts = products.map(prd => {
      const image = images.find(img => img.imageId === prd._id.toString());
      return {
        id: prd._id,
        productName: prd.ProductName,
        collection: prd.CollectionName,
        normalPrice: prd.NormalPrice,
        offerPrice: prd.OfferPrice,
        rating: prd.rating,
        image: image ? image.ImageUrl : null
      };
    });

    return res.status(200).json({ allProducts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(404).json({ message: "Invalid Id or No Id" })
    const product = await productModel.findById(id);
    const images = await imageModel.find({ imageId: product._id });
    return res.status(200).json({
      product,
      images
    })
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error"
    })
  }
}

exports.postComments = async (req, res) => {
  try {
    const { Avatar, Comment, ProductId, Rating, UserId, Date } = req.body;

    // Validate required fields
    if (!UserId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (!Comment || Comment.trim().length === 0) {
      return res.status(201).json({
        success: false,
        message: "Comment text is required"
      });
    }

    if (!ProductId) {
      return res.status(401).json({
        success: false,
        message: "Product ID is required"
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
      Avatar: Avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(UserId)}&background=random`
    };

    // Save to database
    const newComment = await commentModel.create(commentsData);

    const productData = await productModel.findById({ _id: commentsData.ProductId })
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
        Avatar: newComment.Avatar
      }
    });

  } catch (err) {
    console.error("Error posting comment:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;
    if (!await productModel.findById(id)) {
      return res.status(404).json({ message: "Product not found" });
    }
    const comments = await commentModel.find({ ProductId: id })
      .sort({ Date: -1 });
    return res.status(200).json({ comments });
  } catch (err) {
    console.error("Error fetching comments:", err);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

exports.getRandomSixProduct = async (req, res) => {
  try {
    const products = await productModel.aggregate([
      { $sample: { size: 6 } }
    ]);

    const productIds = products.map(p => p._id);

    const images = await imageModel.find(
      { imageId: { $in: productIds } },
      { imageId: 1, ImageUrl: 1 }
    );

    const response = {
      products: products.map(prd => {
        const productImage = images.find(img =>
          img.imageId.toString() === prd._id.toString()
        );

        return {
          ...prd,
          imageUrl: productImage?.ImageUrl || null
        };
      })
    };

    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message
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

    if (!await productModel.findById(id))
      return res.status(404).json({ message: "NoInvalidId" })

    const imageData = {
      imageId: id,
      from: "PRDIMG",
      ImageUrl: req.body.imageURL
    }
    await imageModel.create(imageData);
    return res.status(200).json({
      message: "Image Updated..."
    })

  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error"
    })
  }
}

exports.getProductsOrderedByFlashSale = async (req, res) => {
  try {
    const flashSale = await productModel.find({ flashSale: "true" }).lean();
    const productImage = await imageModel.find({}).lean();

    const flashProducts = flashSale.map((flsh) => {
      // Pick the first matching image for this product
      const image = productImage.find(
        (img) => img.imageId === flsh._id.toString()
      );

      return {
        id: flsh._id,
        productName: flsh.ProductName,
        collection: flsh.CollectionName,
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

    const trendProducts = products.map(prd => {
      const image = images.find(img => img.imageId === prd._id.toString());

      return {
        id: prd._id,
        productName: prd.ProductName,
        collection: prd.CollectionName,
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



