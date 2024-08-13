// code to connect to mongodb database
require('dotenv').config()
const moongose = require('mongoose')


// connect to mongoDB
const connectToMongo = async () => {
    await moongose.connect(process.env.MONGO_URI, () => {
        console.log('successfully connected to moongose')
    })
}

// export connectToMongo function
module.exports = connectToMongo