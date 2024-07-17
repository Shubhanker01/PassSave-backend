// importing express
const express = require('express')
const router = express.Router()

// importing bankAccounts model
const Bankaccount = require('../../Models/Bankaccount')

// Endpoint 1: Adding a bank credential by user
router.post('/add/:userId', async (req, res) => {
    try {
        // destructuring
        let { title, bankName, accountNo, accountType, pin, cifNo } = req.body
        let { userId } = req.params
        // if title is entered
        if (title) {
            let userBankCredentials = await Bankaccount.create({
                userId: userId,
                title: title,
                bankName: bankName,
                accountNo: accountNo,
                accountType: accountType,
                pin: pin,
                cifNo: cifNo
            })
            if (userBankCredentials) {
                let data = await Bankaccount.findById(userBankCredentials._id)
                res.json({
                    status: "Success",
                    data: data
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
                message: "Please enter your title"
            })
        }
    } catch (error) {
        console.log(error)
    }
})

// Endpoint 2: Updating bank credential by the user
router.post('/update/:id', async (req, res) => {
    try {
        // destructuring
        let { title, bankName, accountNo, accountType, pin, cifNo } = req.body
        let { id } = req.params
        let updateBankDetails = {}
        // update title
        if (title) {
            updateBankDetails.title = title
        }
        // udpate bankname
        if (bankName) {
            updateBankDetails.bankName = bankName
        }
        // udpate account no
        if (accountNo) {
            updateBankDetails.accountNo = accountNo
        }
        // update account type
        if (accountType) {
            updateBankDetails.accountType = accountType
        }
        // update pin
        if (pin) {
            updateBankDetails.pin = pin
        }
        // update cif number
        if (cifNo) {
            updateBankDetails.cifNo = cifNo
        }
        // find bank details by id
        let bankDetails = await Bankaccount.findById(id)
        if (bankDetails) {
            let updatedBankDetails = await Bankaccount.findByIdAndUpdate(id, { $set: updateBankDetails }, { new: true })
            if (updatedBankDetails) {
                res.json({
                    status: "Success",
                    data: updatedBankDetails
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
                message: "Could not find your bank details."
            })
        }

    } catch (error) {
        console.log(error)
    }
})

// Endpoint 3: Fetching the user bank account details
router.get('/fetch/:userId', async (req, res) => {
    try {
        // destructuring
        let { userId } = req.params
        // find saved bank details of user
        let userBankDetails = await Bankaccount.find({ userId: userId })
        // check for valid userId
        if (userId.match(/^[0-9a-fA-F]{24}$/)) {
            // if userId exists and has saved bank details
            if (userBankDetails.length > 0) {
                res.json({
                    status: "Success",
                    data: userBankDetails
                })
            }
            else {
                res.json({
                    status: "Success",
                    data: userBankDetails
                })
            }
        }
        else {
            res.json({
                status: "Error",
                message: "Did not found user id."
            })
        }
    } catch (error) {
        console.log(error)
    }
})

// Endpoint 4: Deleting a user bank account detail
router.delete('/delete/:id', async (req, res) => {
    try {
        // destructuring
        let { id } = req.params
        let bankDetails = await Bankaccount.findById(id)
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            if (bankDetails) {
                await Bankaccount.findByIdAndDelete(id)
                res.json({
                    status: "Success",
                    message: "Your bank detail is successfully deleted."
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
                message: "Invalid Id"
            })
        }
    } catch (error) {
        console.log(error)
    }
})

// export the router
module.exports = router

