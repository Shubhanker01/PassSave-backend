// import bcypt
const bcrypt = require('bcrypt')

// hash data asynchronously
const hashData = async (data, saltRounds = 10) => {
    try {
        const hashedData = await bcrypt.hash(data, saltRounds)
        return hashedData
    } catch (error) {
        console.log(error)
    }
}

// export the function
module.exports = hashData