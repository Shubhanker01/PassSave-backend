// importing express
const express = require('express')
const router = express.Router()

// importing Payment card model
const Paymentcard = require('../../Models/Paymentcard')

// Endpoint 1: Adding a payment card detail
router.post('/add/:userId', async (req, res) => {
    try {
        // destructuring
        let { title, cardName, cardType, number, securityCode } = req.body
        let { userId } = req.params
        // if title is entered
        if (title) {
            // create a new card detail
            let paymentCardDetails = await Paymentcard.create({
                userId: userId,
                title: title,
                cardName: cardName,
                cardType: cardType,
                number: number,
                securityCode: securityCode
            })
            if (paymentCardDetails) {
                res.json({
                    status: "Success",
                    data: paymentCardDetails
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
                message: "Please enter your title."
            })
        }
    } catch (error) {
        console.log(error)
    }
})


// Endpoint 2: Updating a payment card detail
router.post('/update/:id', async (req, res) => {
    try {
        // destructuring
        let { title, cardName, cardType, number, securityCode } = req.body
        let { id } = req.params
        // empty object
        let updatePaymentCard = {}
        // if title is to be updated
        if (title) {
            updatePaymentCard.title = title
        }
        // if card name is to be updated
        if (cardName) {
            updatePaymentCard.cardName = cardName
        }
        // if card type is to be updated
        if (cardType) {
            updatePaymentCard.cardType = cardType
        }
        // if number is to be updated
        if (number) {
            updatePaymentCard.number = number
        }
        // if security code is to be updated
        if (securityCode) {
            updatePaymentCard.securityCode = securityCode
        }
        // find card details by id
        let paymentCard = await Paymentcard.findById(id)
        // if id is valid
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            // update the existing card detail
            paymentCard = await Paymentcard.findByIdAndUpdate(id, { $set: updatePaymentCard }, { new: true })
            if (paymentCard) {
                res.json({
                    status: "Success",
                    data: paymentCard
                })
            }
            else {
                res.json({
                    status: "Error",
                    message: "Some error occured while updating."
                })
            }
        }
        else {
            res.json({
                status: "Error",
                message: "Invalid Id"
            })
        }
    } catch (error) {
        console.log(error)
    }
})

// Endpoint 3: Getting a user payment card details
router.get('/fetch/:userId', async (req, res) => {
    try {
        // destructuring
        let { userId } = req.params
        // check if user id is valid
        if (userId.match(/^[0-9a-fA-F]{24}$/)) {
            // find card details by user id
            let cardDetails = await Paymentcard.find({ userId: userId })
            if (cardDetails.length > 0) {
                res.json({
                    status: "Success",
                    data: cardDetails
                })
            }
            else {
                res.json({
                    status: "Success",
                    data: cardDetails
                })
            }
        }
        else {
            res.json({
                status: "Error",
                message: "Invalid Id"
            })
        }
    } catch (error) {
        console.log(error)
    }
})

// Endpoint 4:Deleting a user payment card detail
router.delete('/delete/:id', async (req, res) => {
    try {
        // destructuring
        let { id } = req.params
        // check if id is valid
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            // find the card detail by id and delete it.
            let paymentCardDetail = await Paymentcard.findByIdAndDelete(id)
            // if detail is deleted successfully
            if (paymentCardDetail) {
                res.json({
                    status: "Success",
                    message: "Your details are successfully deleted."
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
                message: "Invalid Id"
            })
        }
    } catch (error) {
        console.log(error)
    }
})

// exporting the router
module.exports = router