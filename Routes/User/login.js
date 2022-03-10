// importing express and bcrypt
const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
// validator
const { body, validationResult } = require('express-validator')
// user Model
const User = require('../../Models/User')

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
            throw Error("Login credentials are incorrect")
        }
        else {
            throw Error("Login credentials are incorrect")
        }
    } catch (error) {
        console.log(error)
    }
})

// export the router
module.exports = router