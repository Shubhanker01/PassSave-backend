// importing mongoose
const mongoose = require('mongoose')
const { Schema } = mongoose
// importing mongoose field encryption
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;

// creating payment card schema
const paymentCard = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    title: {
        type: String
    },
    cardName: {
        type: String
    },
    cardType: {
        type: String
    },
    number: {
        type: String
    },
    securityCode: {
        type: String
    }
})

// plugin for encrypting mongoose field
paymentCard.plugin(mongooseFieldEncryption, {
    fields: ["cardName", "cardType", "number", "securityCode"],
    secret: process.env.SECRET3,
    saltGenerator: (secret) => secret.slice(0, 16)
});

// export the model
module.exports = mongoose.model('paymentcard', paymentCard)