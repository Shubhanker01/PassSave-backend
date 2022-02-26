// importing mongoose 
const mongoose = require('mongoose')
const { Schema } = mongoose

// create userVerification schema
const userVerificationOtp = new Schema({
    userId: {
        type: String
    },
    otp: {
        type: String
    },
    createdAt: {
        type: Date
    },
    expiresAt:{
        type: Date
    }
})

// export the model
module.exports = mongoose.model('userVerificationOtp', userVerificationOtp)