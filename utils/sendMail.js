const fs = require("fs");
const path = require("path");
const mailService = require("../service/mailService");
const otpSaver = require("../utils/otpSaver");

const sendMail = async (value, email) => {
  console.log("Send Mailer Working....")
  try {
    let mailSubject = "";
    let htmlContent = "";

    if (value === "OTP") {
      const randomGenOTP = Math.floor(100000 + Math.random() * 900000);
      mailSubject = "Registration One-Time Password";

      const templatePath = path.join(__dirname, "../templates/otpTemplate.html");
      htmlContent = fs.readFileSync(templatePath, "utf-8");
      htmlContent = htmlContent.replace("{{OTP}}", randomGenOTP);
      // otp saver
      otpSaver(email, randomGenOTP)
      
    } else if ( value === "ORDCNFRM") {
        mailSubject = "Order Confirmation";
        const templatePath = path.join(__dirname, "../templates/orderConfirm.html");
        htmlContent = fs.readFileSync(templatePath, "utf-8");
        htmlContent = htmlContent.replace()
    }

    await mailService(email, mailSubject, htmlContent);
    console.log("Mail Sent...");
    return true;
  } catch (err) {
    console.log(err);
  }
};

module.exports = sendMail;
