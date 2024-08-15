const jwt = require('jsonwebtoken')
require('dotenv').config()

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    jwt.verify(token, process.env.JWT_SECRET, function (err) {
        if (err) {
            res.status(401).send(err)
            return
        }
        next()
    })
}

module.exports = authenticateToken