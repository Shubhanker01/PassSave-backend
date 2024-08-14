const jwt = require('jsonwebtoken')
require('dotenv').config()

function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    jwt.verify(token,process.env.JWT_SECRET,function(err,decoded){
        if(err){
            res.send({status:"error",message:"Invalid Authorization"})
            return
        }
        return decoded
    })
    next()
}

module.exports = authenticateToken