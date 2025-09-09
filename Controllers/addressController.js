const addressModel = require("../Models/AddressModel");
const userModel = require("../Models/userModel");

exports.addAddress = async(req, res) => {
    try{
        const { type, name, address, city, state, zipCode, phone, id, isSaved, district, landmark } = req.body;
        // console.log(isSaved);
        const isUser = await userModel.findById(id)
        if(!isUser)
            return res.status(404).json({ message : "NoUserOnMyRecord" });
        const addressData = {
            UserId : isUser._id,
            type, name, address, city, state, zipCode, phone, isSaved, district, landmark
        }
        await addressModel.create(addressData);
        return res.status(200).json({ message : "Address Added..."})
    } catch(err){
        return res.status(404).json({
            message : "Internal Server Error"
        })
    }
}

exports.getAddressByUserId = async(req, res) => {
    try{
        const { id } = req.params;
        if(!await userModel.findById(id))
            return res.status(404).json({ message : "NoUserOnRecord" });
        const address = await addressModel.find({ UserId : id, isSaved: true });
        return res.status(200).json({address});
    } catch(err){
        return res.status(404).json({ message : "Internal Server Error" });
    }
}

exports.getAddressByIdOrder = async(req, res) => {
    try{
        const { id } = req.params;
        console.log(id)
        if(!await addressModel.findById(id))
            return res.status(404).json({ message : "InvalidID" });
        const address = await addressModel.findById(id);
        return res.status(200).json({address});
    } catch(err){
        return res.status(404).json({ message : "Internal Server Error" });
    }
}

exports.deleteAddress = async(req, res) => {
    try{
        const { id } = req.params;
        if(!await addressModel.findById(id))
            return res.status(404).json({ message : "InvalidId" });
        await addressModel.findByIdAndDelete(id)
        return res.status(200).json({ message : "Address Deleted.." })
    } catch(err){
        return res.status(404).json({
            message : "Internal Server Error"
        })
    }
}