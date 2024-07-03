const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { logInLimiter } = require('../middleware/rateLimiter');
const {validateSignUp, validateLogIn, validateResult,validateIsLoggedIn} = require('../middleware/validator');


router.get('/signup', authController.getSignup);

router.post('/signup', validateSignUp, validateResult, authController.postSignup);

router.get('/login', authController.getLogin);

router.post('/login', logInLimiter, validateLogIn, validateResult,  authController.postLogin);

router.get('/profile', validateIsLoggedIn, authController.getProfile);

router.get('/logout', authController.logout);

module.exports = router;

