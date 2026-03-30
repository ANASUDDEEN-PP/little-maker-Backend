const reviewModel = require("../Models/reviewModel");
const userModel = require("../Models/userModel");

exports.addReview = async(req, res) => {
    try{
        const { id } = req.params;
        if(!id)
            return res.status(404).json({ message: "Invalid ID" });

        const { rating, feedback, orderId } = req.body;
        await reviewModel.create({
            rating,
            description: feedback || "",
            likes: 0,
            onAir: false,
            user: id || "",
            orderId,
            createdAt: Date.now()
        })
        return res.status(200).json({
            message: "Review Successfully..."
        })
    } catch(err){
        return res.status(404).json({
            message : "Internal Server Error"
        })
    }
}

exports.getAllReviewToAdmin = async(req, res) => {
    try{
        const reviewDatas = await reviewModel.find({}).lean();
        const userDatas = await userModel.find({}).lean();

        const reviews = reviewDatas.map((rwDt) => {
            const user = userDatas.find((usr) => usr._id?.toString() === rwDt.user?.toString());
            return{
                _id: rwDt._id || "",
                rating: rwDt.rating || "",
                descripton: rwDt.description || "",
                likes: rwDt.likes || 0,
                onAir: rwDt.onAir || false,
                username: user.Name || "",
                userId: user.userId || "",
                createdAt: rwDt.createdAt || Date.now()
            }
        })
        return res.status(200).json({
            reviews
        })
    } catch(err){
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

exports.updateAir = async(req, res) => {
    try{
        const { id } = req.params;
        if(!id)
            return res.status(404).json({ message: "No ID Avalble"});
        
        const { onAir } = req.body;
        await reviewModel.findByIdAndUpdate(
            { _id: id },
            { $set: {
                onAir: onAir
            }},
            { new: true }
        )
        return res.status(200).json({
            success: true
        })
    } catch(err){
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

exports.getOnAirReviews = async(req, res) => {
    try{
        const users = await userModel.find({}).lean();
        const reviews = await reviewModel.find({ onAir: true }).lean();
        const filterReview = reviews.map((rws) => {
            const user = users.find((usr) => usr._id?.toString() === rws.user?.toString());
            return {
                id: rws._id || "",
                avatar: user.profileImg || "",
                review: rws.description || "",
                rating: rws.rating || "0",
                likes: rws.likes || "0",
                userId: user.userId || "",
                name: user.Name || "",
                createdAt: rws.createdAt || ""
            }
        })
        return res.status(200).json({
            filterReview
        })
    } catch(err){
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

exports.fetchLikedOrNot = async(req, res) => {
    try{
        
        return res.status(200).json({
            success: true
        })
    } catch(err){
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

exports.clikedLikeFunction = async (req, res) => {
  try {
    const { feedbackId, userId } = req.body;

    if (!feedbackId || !userId) {
      return res.status(400).json({
        success: false,
        message: "feedbackId and userId are required",
      });
    }

    const feedback = await reviewModel.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    const likedUsers = Array.isArray(feedback.likedUsers)
      ? feedback.likedUsers
      : [];

    const alreadyLiked = likedUsers.some(
      (id) => id.toString() === userId.toString()
    );

    // ✅ No $inc at all — manually calculate new likes count and use $set
    const currentLikes = Number(feedback.likes) || 0;
    const newLikes = alreadyLiked ? currentLikes - 1 : currentLikes + 1;

    const update = alreadyLiked
      ? { $set: { likes: newLikes }, $pull: { likedUsers: userId } }
      : { $set: { likes: newLikes }, $addToSet: { likedUsers: userId } };

    const updated = await reviewModel.findByIdAndUpdate(feedbackId, update, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      likes: updated.likes,
      data: updated,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};