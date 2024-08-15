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
// import sendOtp func
const sendOtp = require('../../Utils/sendOtp')
const jwt = require('jsonwebtoken')
// import hashData func
const hashData = require('../../Utils/hashData')
// env variables
require('dotenv').config()

// Endpoint 1: Add a new user when the user sign up

router.post('/signup', [
    body('name', 'Please enter your name').isLength({ min: 3 }),
    body('email', 'Please enter a valid email').isEmail(),
    body('password', 'Please enter a valid password').isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({ status: "Error", message: "Your credentials are incomplete or wrong!!!" });
    }
    try {
        let encryptedPassword = await hashData(req.body.password)
        // check if the email already exists
        let user = await User.findOne({ email: req.body.email })
        // if email exists give error
        if (user) {
            res.json({
                status: "Error",
                message: "This email is already taken"
            })
        }
        // create a new user
        else {
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: encryptedPassword,
                verified: false
            })
            if (user) {
                let msg = `<h1>Your OTP is given below. Enter this OTP in the app to verify your email address and complete the sign up process.</h1>
                <h2>This otp expires in 30 minutes.</h2>
                `
                // send otp to the user's email
                await sendOtp(user, msg)
                res.json({
                    status: "Pending",
                    message: "Verification email sent",
                    userId: user._id
                })
            }
            else {
                throw Error("Some error occured")
            }
        }

    } catch (error) {
        console.log(error)
    }
})

// verify otp email
router.post("/verifyotp/:userId", async (req, res) => {
    try {
        // destructuring
        let { otp } = req.body

        if (!otp) {
            res.json({
                status: "Error",
                message: "Empty record is not allowed."
            })
        }
        else {
            const userOtpVerificationRecords = await UserVerificationOtp.find({ userId: req.params.userId })
            if (userOtpVerificationRecords.length <= 0) {
                //   no record found
                res.json({
                    status: "Error",
                    message: "Record doesn't exists or has been verified already."
                })
                console.log(userOtpVerificationRecords)
            }
            else {
                // user otp records exists
                const { expiresAt } = userOtpVerificationRecords[0]
                const hashedOTP = userOtpVerificationRecords[0].otp
                if (expiresAt < Date.now()) {
                    // user otp record has expired
                    await UserVerificationOtp.deleteMany({ userId: req.params.userId })
                    await User.findByIdAndDelete(req.params.userId)
                    res.json({
                        status: "Error",
                        message: "Code has expired please request again."
                    })
                }
                else {
                    const validOtp = await bcrypt.compare(otp, hashedOTP)
                    if (!validOtp) {
                        // otp is wrong
                        res.json({
                            status: "Error",
                            message: "Invalid code written please check your inbox."
                        })
                    }
                    else {
                        // success
                        // update the verification to true
                        await User.updateOne({ _id: req.params.userId }, { verified: true })
                        let document = User.findById(req.params.userId)
                        let jwtuser = { "id": document._id, "name": document.name, "email": document.email }
                        // delete the verifiedOtp no longer required
                        await UserVerificationOtp.deleteMany({ userId: req.params.userId })
                        let token = jwt.sign(jwtuser, process.env.JWT_SECRET)
                        res.json({
                            status: "Verified",
                            message: "User email verified successfully",
                            token: token
                        })
                    }
                }
            }

        }
    } catch (error) {
        console.log(error)
        throw new Error("Some error occured")
    }
})

// export the router
module.exports = router