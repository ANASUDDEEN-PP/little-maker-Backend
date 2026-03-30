require('dotenv').config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport(
    {
        secure : true,
        host : 'smtp.gmail.com',
        port: 465,
        auth : {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    }
);

const sendMail = (email, mailSubject, text) => {
    try{
        transporter.sendMail({
        from: `"The Little Maker" <${process.env.EMAIL_USER}>`,
        to : email,
        subject : mailSubject,
        html : text
    });
    console.log(`✅ Email Sended to the ${email} address...`)
    return true;
    } catch(err){
        return false;
    }
}

module.exports = sendMail;