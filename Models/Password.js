// importing mongoose
const mongoose = require('mongoose')
const { Schema } = mongoose

// importing mongoose field encryption
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;

// creating schema for password
const Password = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    
    title: {
        type: String
    },
    email:{
        type:String
    }
    ,
    password: {
        type: String
    },
    createdAt: {
        type: Date
    }
})

// plugin for encrypting mongoose field
Password.plugin(mongooseFieldEncryption, {
    fields: ["password","title"],
    secret: process.env.SECRET,
    saltGenerator: (secret) => secret.slice(0,16)
});

// export the model
module.exports = mongoose.model('passwords', Password)