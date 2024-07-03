const express = require('express');
const router = express.Router();
const controller = require('../controllers/eventController');
const {validateIsLoggedIn} = require('../middleware/validator');
const multer = require('multer');
const path = require('path');

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img'); // Save to public/img directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});
const upload = multer({ storage: storage });

//GET /events: send all events to the user
router.get('/', controller.index);

//GET /events/new: send html form for creating a new story.
router.get('/new', controller.new);

//POST /events: create a new story.
router.post('/', upload.single('image'), controller.create);

//GET /events/:id: send details of events identified by ID
router.get('/:id', controller.show);

//GET  /events/:id/edit: send html form for editing an exsiting event.
router.get('/:id/edit', controller.edit);

//PUT /events/:id: update the event identified by id.
router.put('/:id', upload.single('image'), controller.update);

//DELETE /events/:id, delete the story identified by id
router.delete('/:id', controller.delete);

// POST /events/:id/rsvp: create or update RSVP for an event
router.post('/:id/rsvp', validateIsLoggedIn, controller.createOrUpdateRSVP);


module.exports = router;