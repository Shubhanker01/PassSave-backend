// importing express and bcrypt
const express = require('express')
const router = express.Router()

// user Model
const User = require('../../Models/User')

// Endpoint 4: Show user information
router.get("/userinfo/:id", async (req, res) => {
    try {
        // destructuring
        let { id } = req.params
        // check if id is valid or not
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            let user = await User.findById(req.params.id)
            // if user is present 
            if (user) {
                res.json({ user })
            }
            else {
                throw Error("Failed to Fetch")
            }
        }
        else {
            throw Error("Failed to fetch or ID is invalid")
        }
    } catch (error) {
        console.log(error)
    }
})

module.exports = router


