// importing mongoose
const mongoose = require('mongoose')
const { Schema } = mongoose
// importing mongoose field encryption
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;

const bankAccounts = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    title: {
        type: String
    },
    bankName: {
        type: String
    },
    accountNo: {
        type: String
    },
    accountType: {
        type: String
    },
    pin: {
        type: String
    },
    cifNo: {
        type: String
    }
})

// plugin for encrypting mongoose field
bankAccounts.plugin(mongooseFieldEncryption, {
    fields: ["bankName", "accountNo", "accountType", "pin", "cifNo"],
    secret: process.env.SECRET2,
    saltGenerator: (secret) => secret.slice(0, 16)
});

// export the model
module.exports = mongoose.model('bankCredentials', bankAccounts)

