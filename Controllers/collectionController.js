const collectionModel = require("../Models/collectionModel");
const productModel = require("../Models/productModel");
const imageModel = require("../Models/ImageModel");


exports.createCollection = async (req, res) => {
  try {
    const { date, image, name } = req.body;
    if (date == "" && image == "" && name == "")
      return res.status(202).json({ message: "All Feilds Are Required.." });
    const collectionData = {
      CollectionName: name,
      CreatedData: date,
      File: image,
    };
    await collectionModel.create(collectionData);
    return res.status(200).json({
      message: "Collection Added Successfully..",
    });
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }
};

exports.getAllCollections = async (req, res) => {
  try {
    const fetchData = await collectionModel.find({});
    return res.status(200).json({
      fetchData,
    });
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }
};

exports.updateCollection = async (req, res) => {
  try {
    console.log("Running");
    const { id } = req.params;
    console.log(id);
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }
};

exports.deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    //check the data available for the curresponding id on the produtModel and set that in a variable
    const collection = await collectionModel.findById(id);
    const isAvailable = await productModel.findOne({
      CollectionName: collection.CollectionName,
    });
    //check if the variable.collectionName and the product.Name is true or false
    if (!isAvailable) {
      await collectionModel.findByIdAndDelete(id);
      return res.status(200).json({
        message: "Collection Deleted",
      });
    }
    return res.status(201).json({
        message : "This Collection contain so many products, If you delete this product please remove all the interlinked Product Datas"
    })
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }
};

exports.getCollectionName = async (req, res) => {
  try {
    const collectionName = await collectionModel.find({});
    return res.status(200).json(collectionName);
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }
};

exports.getAllCollectionWithCount = async (req, res) => {
  try {
    const collectionData = await collectionModel.find({});
    const collectionWithCounts = await Promise.all(
      collectionData.map(async (collection) => {
        const productCount = await productModel.countDocuments({
          CollectionName: collection.CollectionName,
        });
        return {
          id: collection._id,
          name: collection.CollectionName,
          image: collection.File,
          count: productCount,
        };
      })
    );

    return res.status(200).json({ collections: collectionWithCounts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.getRecommendedData = async(req, res) => {
  try{
    const { productId, collectionName } = req.query;
    //check the collection Name is availble on collectionModel
    const collectionId = await collectionModel.findOne({ CollectionName: collectionName });
    if(!collectionId)
      return res.status(200).json({});

    //get the products available curresponding in the collectionId
    const products = await productModel.find({ 
      CollectionName: collectionId._id,
      _id: { $ne: productId }
    });
    const images = await imageModel.find({}).lean();
    
    const recommendedProduct = products.map((prd) => {
      const image = images.find((img) => img.imageId === prd._id.toString());
      // const individualCollection = collectionData.find((intCl) => intCl._id?.toString() === prd.CollectionName?.toString())
      return {
        id: prd._id,
        productName: prd.ProductName,
        // collection: individualCollection.CollectionName,
        normalPrice: prd.NormalPrice,
        offerPrice: prd.OfferPrice,
        rating: prd.rating,
        image: image ? image.ImageUrl : null,
      };
    })
    return res.status(200).json({
      recommendedProduct
    })

  } catch(err){
    return res.status(500).json({
      message : "Internal Server error",
      err
    })
  }
}
