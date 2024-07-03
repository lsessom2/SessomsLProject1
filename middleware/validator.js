const { body } = require('express-validator');
const { validationResult } = require('express-validator');

exports.validateID = (req, res, next) => {
    let id = req.params.id;
    if (!id.match(/^[0-9afA-F]{24}$/)) {
        let err = new Error('Invalid story id');
        err.statyus = 400;
        return next(err);
    } else {
        return next();
    }
};

exports.validateSignUp = [body('firstName', 'First name cannot be empty').notEmpty().trim().escape(),
body('lastName', 'Last name cannot be empty').notEmpty().trim().escape(),
[body('email').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be at least 8 charaters and atmost 64 characters').isLength({ min: 6, max: 64 })]];

exports.validateLogIn = [body('email').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be at least 8 charaters and atmost 64 characters').isLength({ min: 8, max: 64 })];

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.direct('back');
    } else{
        return next();
    } 
};

exports.validateIsLoggedIn = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        req.flash('error', 'You must be logged in to access this page.');
        return res.redirect('/auth/login');
    }
};