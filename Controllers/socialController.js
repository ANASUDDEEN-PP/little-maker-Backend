const socialModel = require("../Models/socialModel");

exports.socailMediaPostUpload = async (req, res) => {
  try {
    console.log(req.body);
    const description = req.body.description;  // ← text fields
    const images = req.files; 
    
    await socialModel.create({
        file: images[0].originalname || "",
        path: images[0].path || "",
        caption: description || "",
        onAir: false
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