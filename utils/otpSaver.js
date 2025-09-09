const otpModel = require("../Models/OTPModel");

const otpSaver = async( email, otp ) => {
    try{
        const otpData = {
            email, otp,
            isExpire: false
        }
        await otpModel.create(otpData);
        return true;
    } catch(err){
        console.log(err);
    }
}

module.exports = otpSaver;