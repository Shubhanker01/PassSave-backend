// importing mongoose
const mongoose = require('mongoose')
const { Schema } = mongoose

// create schema for attachment
const attachments = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    title: {
        type: String
    },
    file: {
        type:String
    }
})

// export the model
module.exports = mongoose.model('attachments', attachments)