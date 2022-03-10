// send email msg
const sendHtmlMsg = (msg, otp) => {
    try {
        return `${msg}<h3>${otp}</h3>`;
    } catch (error) {
        console.log(error)
    }
}

// export the func
module.exports = sendHtmlMsg