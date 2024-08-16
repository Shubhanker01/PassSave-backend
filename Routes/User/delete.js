// importing express and bcrypt
const express = require('express')
const router = express.Router()

// user Model
const User = require('../../Models/User')
const Password = require('../../Models/Password')
const bankAccounts = require('../../Models/Bankaccount')
const paymentCard = require('../../Models/Paymentcard')
const authenticateToken = require('../../Utils/verifyjwt')

const removeUserPasswords = async (id) => {
    try {
        const userPasswords = await Password.exists({ userId: id })
        if (userPasswords) {
            await Password.deleteMany({ userId: id })
        }
        else {
            throw Error("No Passwords found")
        }

    } catch (error) {
        console.log(error)
    }
}

const removeBankDetails = async (id) => {
    try {
        const bankDetails = await bankAccounts.exists({ userId: id })
        if (bankDetails) {
            await bankAccounts.deleteMany({ userId: id })
        }
        else {
            throw Error("no document found to delete")
        }
    } catch (error) {
        console.log(error)
    }
}

const removeCardDetails = async (id) => {
    try {
        const cardDetails = await paymentCard.exists({ userId: id })
        if (cardDetails) {
            await cardDetails.deleteMany({ userId: id })
        }
        else {
            throw Error("no notes found to delete")
        }
    } catch (error) {
        console.log(error)
    }
}

// Endpoint 3: Deleting the user account
router.delete("/deleteaccount", authenticateToken, async (req, res) => {
    try {
        // destructuring
        let { userId } = req.body
        //  check if id is valid
        if (userId.match(/^[0-9a-fA-F]{24}$/)) {
            let user = await User.findByIdAndDelete({ _id: userId })
            if (user) {
                removeUserPasswords(userId)
                removeCardDetails(userId)
                removeBankDetails(userId)
                res.json({
                    status: "Success",
                    message: "Your account is deleted"
                })
            }
            else {
                res.json({
                    status: "Success",
                    message: "Invalid ID"
                })
            }
        }
        else {
            res.json({
                status: "Success",
                message: "Some error occured"
            })
        }
    } catch (error) {
        console.log(error)
    }
})

// export the router
module.exports = router