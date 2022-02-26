// code to connect to mongodb database
const moongose = require('mongoose')

const mongoURI = "mongodb://localhost:27017/passwordManager"

// connect to mongoDB
const connectToMongo = () => {
    moongose.connect(mongoURI, () => {
        console.log('successfully connected to moongose')
    })
}

// export connectToMongo function
module.exports = connectToMongo