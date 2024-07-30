// email handler
const nodemailer = require('nodemailer')
// userverification Otp model
const UserVerificationOtp = require('../Models/UserVerificationOtp')
// import generate Otp
const generateOtp = require('./generateOtp')
// import hashData func
const hashData = require('./hashData')
require('dotenv').config()
// import sendHtmlMsg
const message = require('./sendMsg')

// nodemailer stuff
let transporter = nodemailer.createTransport({
    host:'smtp.ethereal.email',
    port:587,
    secure:false,
    service: 'gmail',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD
    }
})

// testing success
transporter.verify((error, success) => {
    if (error) {
        console.log(error)
    }
    else {
        console.log("Successfull")
        console.log(success)
    }
})

// send otp verification email to the user
const sendOtpVerificationEmail = async ({ _id, email }, msg) => {
    try {
        const otp = await generateOtp()
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify your email",
            html: message(msg, otp)
        }

        // hash the otp
        const hashedOTP = await hashData(otp)
        // creating new instance of verification otp
        const newUserVerificationOtp = await UserVerificationOtp.create({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 1800000
        })
        // save otp verification record
        await newUserVerificationOtp.save()
        // send mail to the user
        transporter.sendMail(mailOptions)
    } catch (error) {
        console.log(error)
        throw Error(error.message)
    }
}

// export the function
module.exports = sendOtpVerificationEmail