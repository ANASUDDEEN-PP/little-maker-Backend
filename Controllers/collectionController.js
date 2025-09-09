const collectionModel = require("../Models/collectionModel");
const productModel = require("../Models/productModel");


exports.createCollection = async(req, res) => {
    try{
        const { date, image, name } = req.body;
        if(date == "" && image == "" && name == "")
            return res.status(202).json({ message : "All Feilds Are Required.." });
        const collectionData = {
            CollectionName : name,
            CreatedData : date,
            File : image
        }
        await collectionModel.create(collectionData);
        return res.status(200).json({
            message: "Collection Added Successfully.."
        })
    } catch(err){
        return res.status(404).json({
            message : "Internal Server Error"
        })
    }
}

exports.getAllCollections = async(req, res) => {
    try{
        const fetchData = await collectionModel.find({});
        return res.status(200).json({
            fetchData
        })
    } catch(err){
        return res.status(404).json({
            message : "Internal Server Error"
        })
    }
}

exports.updateCollection = async(req, res) => {
    try{
        console.log("Running")
        const { id } = req.params;
        console.log(id);
    } catch(err){
        return res.status(404).json({
            message : "Internal Server Error"
        })
    }
}

exports.deleteCollection = async (req, res) => {
    try{
        const { id } = req.params;
        console.log(id)
    } catch(err){
        return res.status(404).json({
            message : "Internal Server Error"
        })
    }
}

exports.getCollectionName = async(req, res) => {
    try{
        const collectionName = await collectionModel.find({});
        return res.status(200).json(collectionName);
    } catch(err){
        return res.status(404).json({
            message : "Internal Server Error"
        })
    }
}

exports.getAllCollectionWithCount = async (req, res) => {
    try {
        const collectionData = await collectionModel.find({});
        const collectionWithCounts = await Promise.all(
            collectionData.map(async (collection) => {
                const productCount = await productModel.countDocuments({ CollectionName: collection.CollectionName });
                return {
                    id : collection._id,
                    name: collection.CollectionName,
                    image: collection.File,
                    count: productCount
                };
            })
        );

        return res.status(200).json({ collections: collectionWithCounts });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};
