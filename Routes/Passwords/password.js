// importing express
const express = require('express')
const router = express.Router()
// validator
const { body, validationResult } = require('express-validator')

// importing Password model
const Password = require('../../Models/Password')

// Endpoint 1: Create and add a new password
router.post('/add/:userId', [
    body('title', "Please enter the title").isLength({ min: 1 }),
    body('password', "Please enter the password field").isLength({ min: 1 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // destructuring
        let { title, password } = req.body
        let { userId } = req.params
        // if title and password are true
        if (title && password) {
           // create a new password vault
            let vault = await Password.create({
                userId: userId,
                title: title,
                password: password,
                createdAt: Date.now()
            })
            if (vault) {
                res.json({
                    status: "Success",
                    data: vault
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
                message: "Please enter the title and password"
            })
        }
    } catch (error) {
        console.log(error)
    }
})

// Endpoint 2: Read the password vault of a particular user
router.get('/read/:userId', async (req, res) => {
    try {
        // destructuring
        let { userId } = req.params
        // find saved passwords of particular user
        let savedPass = await Password.find({ userId: userId })
        // if saved passwords are present
        if (savedPass.length > 0) {
            res.json({
                status: "Success",
                data: savedPass
            })
        }
        else {
            res.json({
                status: "Error",
                message: "No password are there to show"
            })
        }
    } catch (error) {
        console.log(error)
    }
})

// Endpoint 3: Update a particular password vault
router.post('/update/:id', async (req, res) => {
    try {
        let { title, password } = req.body
        let { id } = req.params
        let updatedVault = {}
        if (title) {
            updatedVault.title = title
        }
        if (password) {
            updatedVault.password = password
        }
        let passVault = await Password.findById(id)
        if (passVault) {
            let updatedPassVault = await Password.findByIdAndUpdate(id, { $set: updatedVault, __enc_message: false }, { new: true })
            if (updatedPassVault) {
                res.json({
                    status: "Success",
                    data: updatedPassVault
                })
            }
            else {
                res.json({
                    status: "Error",
                    message: "Some error occured."
                })
            }
        }
        else {
            res.json({
                status: "Error",
                message: "Cannot updated document which doesn't exist."
            })
        }
    } catch (error) {
        console.log(error)
    }
})

// Endpoint 4: Delete a particular saved password
router.delete('/delete/:id', async (req, res) => {
    try {
        let { id } = req.params
        let passVault = await Password.findByIdAndDelete(id)
        if (passVault) {
            res.json({
                status: "Success",
                message: "Your document is successfully deleted."
            })
        }
        else {
            res.json({
                status: "Error",
                message: "Some error occured while deleting document."
            })
        }
    } catch (error) {
        console.log(error)
    }
})

// export the router
module.exports = router

