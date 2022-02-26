// importing express and bcrypt
const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
// validator
const { body, validationResult } = require('express-validator')
// user Model
const User = require('../../Models/User')
// generate salt
const saltRounds = 10

// Endpoint 5: Update the user password by searching the user through email
router.post('/userpassword/:id', [
    body('oldPassword', 'Please enter your old password').isLength({ min: 5 }),
    body("newPassword", "Please enter your new password").isLength({ min: 5 }),
    body("confirmNewPassword", "Please re enter your new password").isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // destructuring
        let { confirmNewPassword, oldPassword, newPassword } = req.body
        let { id } = req.params
        // check if the user has entered the old password and new Password is equal to confirm new password
        if (oldPassword && (newPassword === confirmNewPassword)) {
            //    find the user by email
            let user = await User.findById(id)
            // if user is found 
            if (user) {
                // check if old password written is correct 
                const compare = await bcrypt.compare(oldPassword, user.password)
                if (compare) {
                    // hash the new password
                    let hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)
                    // update the user password in the database
                    let userUpdate = await User.findByIdAndUpdate(id, { password: hashedNewPassword }, { new: true })
                    // if password is successfully updated
                    if (userUpdate) {
                        res.json({
                            status: "Success",
                            user: userUpdate
                        })
                    }
                    else {
                        res.json({
                            status: "Error",
                            message: "Some error occured"
                        })
                    }
                }
                else {
                    res.json({
                        status: "Error",
                        message: "Password entered is incorrect"
                    })
                }
            }
            else {
                res.json({
                    status: "Error",
                    message: "Id not found"
                })
            }
        }
        else {
            res.json({
                status: "Error",
                message: "Your password written is incorrect"
            })
        }
    }
    catch (error) {
        console.log(error)
    }
})

// Endpoint 6 : Update the username 
router.post('/name/:id', [
    body('name', 'Please enter your name').isLength({ min: 3 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // destructuring
        let { name } = req.body
        let { id } = req.params
        if (name && id.match(/^[0-9a-fA-F]{24}$/)) {
            let user = await User.findByIdAndUpdate(id, { name: name }, { new: true })
            if (user) {
                res.json({
                    status: "Success",
                    user: user
                })
            }
            else {
                res.json({
                    status: "Error",
                    message: "Some error occured"
                })
            }
        }
        else {
            res.json({
                status: "Error",
                message: "Please enter your name or invalid id is sent"
            })
        }
    } catch (error) {
        console.log(error)
    }
})

// export the router
module.exports = router
