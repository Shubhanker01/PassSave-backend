// importing express and bcrypt
const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
// validator
const { body, validationResult } = require('express-validator')
// user Model
const User = require('../../Models/User')
const jwt = require('jsonwebtoken')
require('dotenv').config()

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
                let jwtuser = {
                    "id": user._id.toString(),
                    "name": user.name,
                    "email": user.email
                }
                let token = jwt.sign(jwtuser, process.env.JWT_SECRET)
                return res.json({ status: "success", user, token })


            }
            return res.json({ status: "Error", message: "Login credentials are incorrect" })
        }
        else {
            return res.json({ status: "Error", message: "Login credentials are incorrect" })
        }
    } catch (error) {
        console.log(error)
    }
})

// export the router
module.exports = router