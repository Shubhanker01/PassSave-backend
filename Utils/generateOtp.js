// generate otp asynchronously
const generateOtp = async () => {
    try {
        return (otp = `${Math.floor(1000 + Math.random() * 9000)}`)
    } catch (error) {
        console.log(error)
    }
}

// export the function
module.exports = generateOtp