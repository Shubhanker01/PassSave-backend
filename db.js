// code to connect to mongodb database
const moongose = require('mongoose')

const mongoURI = "mongodb+srv://shubhanker40:bca02092001@cluster1.ivvgywy.mongodb.net/PassSave"

// connect to mongoDB
const connectToMongo = async () => {
    await moongose.connect(mongoURI, () => {
        console.log('successfully connected to moongose')
    })
}

// export connectToMongo function
module.exports = connectToMongo