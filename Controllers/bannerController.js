const bannerModel = require("../Models/bannerModel");
const imageModel = require("../Models/ImageModel");

exports.createBanner = async (req, res) => {
  try {
    const { newBanner } = req.body;
    const bannerDetails = {
        title: newBanner.title,
        description: newBanner.description,
        url: newBanner.url,
        brandName: newBanner.brandName,
        backgroundColor: newBanner.backgroundColor
    }
    const pushBanner = await bannerModel.create(bannerDetails);
    await imageModel.create({
        imageId: pushBanner._id,
        from: "CBNR",
        ImageUrl: newBanner.image
    })

    return res.status(200).json({
        message : "Banner Created Successfully"
    })
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }
};

exports.getBannerDetails = async (req, res) => {
  try {
    const banners = await bannerModel.find({}).lean();
    const images = await imageModel.find({ from : "CBNR" }).lean();

    const filterBanner = banners.map((bnr) => {
        const image = images.find((img) => img?.imageId.toString() === bnr?._id.toString());
        return {
            id: bnr?._id || "",
            title: bnr?.title || "",
            description: bnr?.description || "",
            url: bnr?.url || "",
            brandName: bnr?.brandName || "",
            image: image.ImageUrl || "",
            backgroundColor: bnr.backgroundColor || ""
        }
    })

    return res.status(200).json({
        filterBanner
    })
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    if(!id)
        return res.status(404).json({ message : "Invalid ID"});
    await bannerModel.findByIdAndDelete(id);
    await imageModel.findOneAndDelete(id);

    return res.status(200).json({
        message: "Banner Deleted Successfully"
    })
  } catch (err) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }
};