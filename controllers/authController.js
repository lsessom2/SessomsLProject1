const User = require('../models/user');
const Event = require('../models/event');
const RSVP = require('../models/rsvp');

exports.getSignup = (req, res) => {
    res.render('auth/signup');
};


exports.postSignup = (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    const user = new User({ firstName, lastName, email: email.toLowerCase(), password });


    user.save()
        .then(() => {
            req.flash('success', 'You are now registered and can log in');
            res.redirect('/auth/login');
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            if (err.code === 11000) {
                req.flash('error', 'Email address has already been used');
                return res.redirect('back');
            }
            next(err);
        });
};

exports.getLogin = (req, res) => {
    res.render('auth/login');
};

exports.postLogin = (req, res, next) => {
    console.log('We are inside controller');
    const { email, password } = req.body;

    User.findOne({ email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Incorrect email');
                return res.redirect('back');
            }

            user.comparePassword(password)
                .then(isMatch => {
                    if (!isMatch) {
                        req.flash('error', 'Incorrect password');
                        return res.redirect('back');
                    }

                    req.session.user = {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName
                    };

                    // req.session.user = user;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/auth/profile');
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
};

exports.getProfile = (req, res, next) => {
    console.log("We are inside the profile controller");
    let id = req.session.user._id; // taking the id from user 
    if (!req.session.user) {
        console.log("We are inside the user session");
        req.flash('error', 'You must be logged in to view this page');
        return res.redirect('/auth/login');
    }
    // from the user model we take the user id and using the same id we find the events created by that user
    Promise.all([User.findById(id), Event.find({ hostName: id }), RSVP.find({ user: id }).populate('event')]) //hostName is the field that I added in the event schema
        .then(results => {
            const [user, events, rsvps] = results;
            return res.render('./auth/profile', { user, events, rsvps }) //passing the user and events parameter to the profile.ejs
        })
        .catch(err => next(err));
    //res.send("This is the profile page");
};

exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            return next(err);
        }
        res.redirect('/auth/login');
    });

};
