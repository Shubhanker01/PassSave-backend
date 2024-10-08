// importing express
const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')

// importing multer
const multer = require('multer')

// importing Attachments model
const Attachments = require('../../Models/Attachments')
// importing unlink
const { unlink } = require('fs/promises');

const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "pdf") {
        cb(null, true);
    } else {
        cb(new Error("Not a PDF File!!"), false);
    }
};
// store file in server
var storage = multer.diskStorage({
    // path where the file is to be stored
    destination: function (req, file, cb) {
        cb(null, '../../Storage/');
    },
    // name of the file
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

// upload the file in the storage
var upload = multer({ storage: storage, fileFilter: multerFilter });

// Endpoint 1: Uploading the file with title
router.post('/upload/:userId', upload.single("file"), async (req, res) => {
    try {
        // destructure
        let { userId } = req.params
        // if file is present
        if (req.file) {
            console.log(req.file)
            // create attachment
            let attachments = await Attachments.create({
                userId: userId,
                title: req.file.originalname,
                file: req.file.path
            })
            if (attachments) {
                res.json({
                    status: "Success",
                    data: attachments
                })
            }
            else {
                res.json({
                    status: "Error",
                    message: "Some error occured."
                })
            }
        }
        else {
            res.json({
                status: "Error",
                message: "Please enter your file."
            })
        }

    } catch (error) {
        console.log(error)
    }

});

// Endpoint 2: Display attachments of user
router.get('/display/:userId', async (req, res) => {
    try {
        // destructuring
        let { userId } = req.params
        // is userid is valid
        if (userId.match(/^[0-9a-fA-F]{24}$/)) {
            // find user attachment by id
            let attachments = await Attachments.find({ userId: userId })
            // if attachment is present
            if (attachments) {
                res.json({
                    status: "Success",
                    attachments: attachments
                })
            }
            else {
                res.json({
                    status: "Error",
                    message: "Some error occured"
                })
            }

        }
        else {
            res.json({
                status: "Error",
                message: "Invalid Id"
            })
        }
    } catch (error) {
        console.log(error)
    }
})

// Endpoint 3: Download attachment of user
router.get('/download/:id', async (req, res) => {
    try {
        // destructuring
        let { id } = req.params
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            // find user attachment by id
            let attachment = await Attachments.findById(id)
            if (attachment) {
                let file = fs.createReadStream(attachment.file)
                res.writeHead(200, { 'Content-disposition': `attachment;filename:${attachment.title}` })
                file.pipe(res)
            }

            // if (attachment) {
            //     res.json({ attachment: attachment })
            // }
            else {
                res.json({
                    status: "Error",
                    message: "Attachment not found"
                })
            }
        }
    } catch (error) {
        console.log(error)
    }
})

// Endpoint 4: delete the attachment
router.delete('/delete/:id', async (req, res) => {
    try {
        // destructuring
        let { id } = req.params
        // if id is valid
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            // find user attachment by id and delete it
            let attachment = await Attachments.findByIdAndDelete(id)
            if (attachment) {
                (async function (path) {
                    try {
                        // delete attachment from server
                        await unlink(path);
                        res.json({
                            status: "Success",
                            message: "Attachment is successfully deleted."
                        })
                    } catch (error) {
                        res.json({
                            status: "Error",
                            message: error.message
                        })
                    }
                })(attachment.file);

            }
            else {
                res.json({
                    status: "Error",
                    message: "Attachment not found"
                })
            }

        }
    } catch (error) {
        console.log(error)
    }
})


// export the router
module.exports = router