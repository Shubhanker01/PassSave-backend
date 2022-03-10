// importing express and bcrypt
const express = require('express')
const router = express.Router()

// user Model
const User = require('../../Models/User')

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
                throw Error("Did not found your Id")
            }
        }
        else {
            throw Error("Some error occured")
        }
    } catch (error) {
        console.log(error)
    }
})

// export the router
module.exports = router