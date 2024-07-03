const express = require('express');
const router = express.Router();
const controller = require('../controllers/mainController');

// GET /: Home page
router.get('/', controller.home);

// GET /about: About page
router.get('/about', controller.about);

// GET /contact: Contact page
router.get('/contact', controller.contact);

module.exports = router;
