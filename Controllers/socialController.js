const socialModel = require("../Models/socialModel");

exports.socailMediaPostUpload = async (req, res) => {
  try {
    console.log(req.body);
    const description = req.body.caption;  // ← text fields
    const images = req.files; 
    
    await socialModel.create({
        file: images[0].filename || "",
        path: images[0].path || "",
        caption: description || "",
        onAir: false,
        date: Date.now()
    })
    return res.status(200).json({
        success: true
    })
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.updateAir = async (req, res) => {
  try {
    const { id } = req.params;
    const { onAir } = req.body;
    if(!id)
      return res.status(404).json({ message: "No Id Avail"});

    await socialModel.findByIdAndUpdate(
      { _id: id },
      { $set: {
        onAir: onAir || false
      }},
      { new: true}
    )
    
    return res.status(200).json({
        success: true
    })
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getAllSocial = async (req, res) => {
  try {
    const datas = await socialModel.find({}).lean();
    return res.status(200).json({
        posts: datas
    })
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    if(!id)
      return res.status(404).json({ message: "N/a Id"});

    await socialModel.findByIdAndDelete(id);
    return res.status(200).json({
        result: true
    })
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.fetchAirPost = async (req, res) => {
  try {
    const data = await socialModel.find({ onAir: true}).lean();
    return res.status(200).json({
        posts: data
    })
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};