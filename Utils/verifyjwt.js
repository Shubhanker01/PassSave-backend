const jwt = require('jsonwebtoken')
require('dotenv').config()

function verifyjwt(token){
    jwt.verify(token,process.env.JWT_SECRET,function(err,decoded){
        if(err){
            return "error"
        }
        else{
            return "verified"
        }
    })

}

module.exports = verifyjwt