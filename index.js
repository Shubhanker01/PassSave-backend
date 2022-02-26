// importing express
const express= require('express')
const app = express()
// importing connectToMongo
const connectToMongo = require('./db')
const port = 4000

connectToMongo()
// this code needs to be used before specifying route path
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

// route for authentication
app.use('/auth',require('./Routes/User/auth'))

// route for reseting user password
app.use('/reset',require('./Routes/User/forgotPassword'))

// route for updation
app.use('/update',require('./Routes/User/update'))

// route for notes
app.use('/notes',require('./Routes/Notes/notes'))

// route for password
app.use('/password',require('./Routes/Passwords/password'))



app.listen(port, () => {
    console.log(`Password Manager backend listening at http://localhost:${port}`)
})