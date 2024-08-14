// importing express
const express = require('express')
const router = express.Router()
// validator
const { body, validationResult } = require('express-validator')

// importing Notes model
const Notes = require('../../Models/Notes')

// Endpoint for notes
// Endpoint 1: Creating a note by a particular user
router.post('/create/:userId', [
    body('title', 'Add a title').isLength({ min: 1 }),
    body('description', 'Add a description').isLength({ min: 1 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // destructuring
        let { title, description } = req.body
        let { userId } = req.params
        // if title and description is true
        if (title && description) {
            // create a new note
            let notes = await Notes.create({
                userId: userId,
                title: title,
                description: description,
                createdAt: Date.now()
            })
            if (notes) {
                res.json({
                    status: "Success",
                    notes: notes
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
                message: "Please enter title or description"
            })
        }
    } catch (error) {
        console.log(error)
    }
})


// Endpoint 2: Fetch notes of a particular user
router.get('/fetchnotes/:userId', async (req, res) => {
    try {
        // destructuring
        let { userId } = req.params
        // find notes by id 
        let notes = await Notes.find({ userId: userId })
        if (notes) {
            res.json({
                status: "Success",
                notes: notes
            })
        }
        else {
            res.json({
                status: "Error",
                message: "Some error occured while fetching notes."
            })
        }
    } catch (error) {
        console.log(error)
    }
})

// Endpoint 3: Deleting a particular note
router.delete('/delete/:id', async (req, res) => {
    try {
        //    destructuring
        let { id } = req.params
        if (id) {
            // find the note of the user to delete
            let notes = await Notes.findByIdAndDelete(id)
            // if note is found and deleted
            if (notes) {
                res.json({
                    status: "Success",
                    message: "Your note is successfully deleted"
                })
            }
            else {
                res.json({
                    status: "Error",
                    message: "No notes found"
                })
            }
        }
        else {
            res.json({
                status: "Error",
                message: "Some error occured"
            })
        }

    } catch (error) {
        console.log(error)
    }
})

// Endpoint 4: Updating a particular note
router.post('/update/:id', async (req, res) => {
    try {
        // destructuring
        const { title, description } = req.body
        const { id } = req.params
        let updatedNote = {}
        // updating title
        if (title) {
            updatedNote.title = title
        }
        // updating description
        if (description) {
            updatedNote.description = description
        }
        // find notes by id
        let notes = await Notes.findById(id)
        if (notes) {
            let notesUpdated = await Notes.findByIdAndUpdate(id, { $set: updatedNote }, { new: true })
            if(notesUpdated){
                res.json({
                    status:"Success",
                    notes:notesUpdated
                })
            }
            else{
                res.json({
                    status:"Error",
                    message:"Failed to update notes"
                })
            }
        }
        else {
            res.json({
                status:"Error",
                message:"Notes not found"
            })   
        }
    } catch (error) {
        console.log(error)
    }
})

// export the router
module.exports = router