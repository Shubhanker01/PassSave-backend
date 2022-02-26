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

// Endpoint 1: Add a new user when the user sign up

router.post('/signup', [
    body('name', 'Please enter your name').isLength({ min: 3 }),
    body('email', 'Please enter a valid email').isEmail(),
    body('password', 'Please enter a valid password').isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let encryptedPassword = await bcrypt.hash(req.body.password, saltRounds)
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
                // send otp to the user's email
                sendOtpVerificationEmail(user, res)
            }
            else {
                res.json({
                    status: "Error",
                    message: "Some error occured"
                })
            }
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
            subject: "Verify your email",
            html: `<h1>Your OTP is <b>${otp}</b>. Enter this OTP in the app to verify your email address and complete the sign up process</h1><h3>This otp expires in 30 minutes</h3>`
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

// verify otp email
router.post("/verifyotp/:userId", async (req, res) => {
    try {
        // destructuring
        let { otp } = req.body

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
                        throw new Error("Invalid code written Please check your inbox")
                    }
                    else {
                        // success
                        // update the verification to true
                        await User.updateOne({ _id: req.params.userId }, { verified: true })
                        // delete the verifiedOtp no longer required
                        await UserVerificationOtp.deleteMany({ userId: req.params.userId })
                        res.json({
                            status: "Verified",
                            message: "User email verified successfully"
                        })
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

// Endpoint 2: When the user log in 
router.post('/login', [
    body('email', "Enter your email").isEmail(),
    body("password", "Enter your password").isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // destructuring email and password from req.body
        let { email, password } = req.body
        // find email of user
        let user = await User.findOne({ email: email })
        // if user is found and verfication is true
        if (user && user.verified === true) {
            let passwordCompare = await bcrypt.compare(password, user.password)
            if (passwordCompare) {
                return res.json({ status: "success", user })
            }
            return res.json({ status: "error", message: "Login credentials are incorrect" })
        }
        else {
            return res.json({ status: "error", message: "Login credentials are incorrect" })
        }
    } catch (error) {
        console.log(error)
    }
})

// Endpoint 3: Deleting the user account
router.delete("/deleteaccount", async (req, res) => {
    try {
        // destructuring
        let { userId } = req.body
        //  check if id is valid
        if (userId.match(/^[0-9a-fA-F]{24}$/)) {
            let user = await User.findByIdAndDelete({ _id: userId })
            if (user) {
                res.json({
                    status: "Success",
                    message: "Your account is deleted"
                })
            }
            else {
                res.json({
                    status: "Error",
                    message: "Did not found your id"
                })
            }
        }
        else {
            res.json({
                status: "Error",
                message: "Some error occured"
            })
        }
    } catch (error) {
        console.log(error)
    }
})

// Endpoint 4: Show user information
router.get("/userinfo/:id", async (req, res) => {
    try {
        // destructuring
        let {id} = req.params
        // check if id is valid or not
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            let user = await User.findById(req.params.id)
            // if user is present 
            if(user){
                res.json({ user })
            }
            else{
                res.json({
                    status:"Error",
                    message:"Failed to fetch"
                })
            }
        }
        else {
            res.json({
                status: "Error",
                message: "Failed to Fetch or id is invalid"
            })
        }
    } catch (error) {
        console.log(error)
    }
})

module.exports = router