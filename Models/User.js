// importing mongoose
const mongoose = require('mongoose')
const { Schema } = mongoose

// creating schema for user
const users = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    verified:{
        type: Boolean
    }
})

// exporting the model
module.exports = mongoose.model('users', users)