// importing mongoose
const mongoose = require('mongoose')
const { Schema } = mongoose

// creating schema for the notes
const Notes = new Schema({
    // refer to the user
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    title:{
        type:String
    },
    description:{
        type:String
    },
    createdAt:{
        type:Date
    }

})

// export the model
module.exports = mongoose.model('notes',Notes)