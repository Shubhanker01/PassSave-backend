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

// import hashData func
const hashData = require('../../Utils/hashData')
const jwt = require('jsonwebtoken')
const authenticateToken = require('../../Utils/verifyjwt')

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
            let jwtuser = { "name": user.name, "email": user.email }
            if (user) {
                let msg = `<h1>Password Reset</h1>
                <h2>Your OTP is given below. Enter this OTP in the app to verify your email address and reset your password.</h2>
                <h2>This otp expires in 30 minutes.</h2>
                `
                // send password reset otp
                await sendOtp(user, msg)
                let resetToken = jwt.sign(jwtuser, process.env.JWT_SECRET)
                res.json({
                    status: "Pending",
                    message: "Verification email sent",
                    userId: user._id,
                    token: resetToken
                })
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

// Endpoint 2:Send Otp and reset your password
router.post("/otp/:userId", [
    body('password', 'Password minimum length should be 5').isLength({ min: 5 }),
    body('confirmPassword', 'Password minimum length should be 5').isLength({ min: 5 })
], authenticateToken, async (req, res) => {
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
                res.json({
                    status: "Error",
                    message: "No record has been found"
                })
            }
            else {
                // user otp records exists
                const { expiresAt } = userOtpVerificationRecords[0]
                const hashedOTP = userOtpVerificationRecords[0].otp
                if (expiresAt < Date.now()) {
                    // user otp record has expired
                    await UserVerificationOtp.deleteMany({ userId: req.params.userId })
                    res.json({
                        status: "Error",
                        message: "Code has been expired!! Please request again"
                    })
                }
                else {
                    const validOtp = await bcrypt.compare(otp, hashedOTP)
                    if (!validOtp) {
                        // otp is wrong
                        res.json({
                            status: "Error",
                            message: "Invalid OTP written. Please check your inbox!!1"
                        })
                    }
                    else {
                        // success
                        // check if password is equal to confirm password
                        if (password === confirmPassword) {
                            // delete OTP record
                            await UserVerificationOtp.deleteMany({ userId: req.params.userId })
                            // encrypt the new password
                            let encryptedPassword = await hashData(password)
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

