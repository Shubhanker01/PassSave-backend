// importing express and bcrypt
const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
// validator
const { body, validationResult } = require('express-validator')
// user Model
const User = require('../../Models/User')
// userverification Otp model
const UserVerificationOtp = require('../../Models/UserVerificationOtp')
// generate salt
const saltRounds = 10
// email handler
const nodemailer = require('nodemailer')

// env variables
require('dotenv').config()

// nodemailer stuff
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD
    }
})

// Endpoint 1: Sending the email and verify the otp
router.post('/verify', [
    body("email", "Please enter a valid email").isEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // destructuring
        let { email } = req.body
        if (email) {
            let user = await User.findOne({ email: email })
            if (user) {
                // send password reset otp
                sendOtpVerificationEmail(user, res)
            }
            else {
                res.json({
                    status: "Error",
                    message: "Did not find your email"
                })
            }
        }
        else {
            res.json({
                status: "Error",
                message: "Please enter your email"
            })
        }
    } catch (error) {
        console.log(error)
    }
})

// send otp verification email to the user
const sendOtpVerificationEmail = async ({ _id, email }, res) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Password Reset",
            html: `<h1>Your OTP is <b>${otp}</b>. Enter this OTP in the app to verify your email address and reset your password</h1><h3>This otp expires in 30 minutes</h3><h4>Please do not share this OTP with anyone</h4>`
        }

        // hash the otp
        const hashedOTP = await bcrypt.hash(otp, saltRounds)
        // creating new instance of verification otp
        const newUserVerificationOtp = new UserVerificationOtp({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 1800000
        })
        // save otp verification record
        await newUserVerificationOtp.save()
        // send mail to the user
        transporter.sendMail(mailOptions)
        res.json({
            status: "Pending",
            message: "Verification Otp sent",
            userId: _id
        })
    } catch (error) {
        console.log(error)
        res.json({
            status: "Failed",
            message: error.message,
        })
    }
}

// Endpoint 2:Send Otp and reset your password
router.post("/otp/:userId", [
    body('password', 'Password minimum length should be 5').isLength({ min: 5 }),
    body('confirmPassword', 'Password minimum length should be 5').isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // destructuring
        let { otp, password, confirmPassword } = req.body
        // check if OTP is entered
        if (!otp) {
            throw Error("Empty details are not allowed")
        }
        else {
            const userOtpVerificationRecords = await UserVerificationOtp.find({ userId: req.params.userId })
            if (userOtpVerificationRecords.length <= 0) {
                //   no record found
                throw new Error("Record doesn't exists or has been verified already")
            }
            else {
                // user otp records exists
                const { expiresAt } = userOtpVerificationRecords[0]
                const hashedOTP = userOtpVerificationRecords[0].otp
                if (expiresAt < Date.now()) {
                    // user otp record has expired
                    await UserVerificationOtp.deleteMany({ userId: req.params.userId })
                    throw new Error("Code has expired please request again")
                }
                else {
                    const validOtp = await bcrypt.compare(otp, hashedOTP)
                    if (!validOtp) {
                        // otp is wrong
                        throw new Error("Invalid OTP written Please check your inbox")
                    }
                    else {
                        // success
                        // check if password is equal to confirm password
                        if (password === confirmPassword) {
                            // delete OTP record
                            await UserVerificationOtp.deleteMany({ userId: req.params.userId })
                            // encrypt the new password
                            let encryptedPassword = await bcrypt.hash(password, saltRounds)
                            // reset and update the user password
                            await User.findByIdAndUpdate(req.params.userId, { password: encryptedPassword }, { new: true })

                            res.json({
                                status: "Success",
                                message: "Password reset is successfull"
                            })
                        }
                        else {
                            res.json({
                                status: "Error",
                                message: "Please enter correct password"
                            })
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.log(error)
        res.json({
            status: "Failed",
            message: error.message
        })
    }
})

// export the router
module.exports = router

