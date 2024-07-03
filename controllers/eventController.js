const Event = require('../models/event');
const RSVP = require('../models/rsvp');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');

exports.index = (req, res, next) => {
    Event.find()
        .then(events => {
            const categories = [...new Set(events.map(event => event.category))];
            res.render('events/events', { events, categories });
        })
        .catch(err => next(err));
};

exports.new = (req, res) => {
    res.render('events/newEvent');
};

exports.create = (req, res, next) => {
    const event = new Event({
        title: req.body.title,
        category: req.body.category,
        start: req.body.start,
        end: req.body.end,
        location: req.body.location,
        details: req.body.details,
        image: req.file ? '/img/' + req.file.filename : null,
        hostName: req.session.user._id 
    });

    event.save()
        .then(() => res.redirect('/events'))
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                return res.redirect('back'); 
            }
            next(err);
        });
};

exports.show = (req, res, next) => {
    let id = req.params.id;
    Event.findById(id).populate('hostName')
        .then(event => {
            if (event) {
                console.log('Event:', event);
                console.log('CurrentUser:', req.session.user);
                res.render('events/event', { event, currentUser: req.session.user });
            } else {
                let err = new Error('Cannot show event with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.edit = (req, res, next) => {
    let id = req.params.id;
    Event.findById(id)
        .then(event => {
            if (event) {
                res.render('events/edit', { event });
            } else {
                let err = new Error('Cannot edit event with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.update = (req, res, next) => {
    let id = req.params.id;
    Event.findById(id)
        .then(event => {
            if (!event) {
                let err = new Error('Cannot update event with id ' + id);
                err.status = 404;
                throw err;
            }

            // Update event fields
            event.title = req.body.title;
            event.category = req.body.category;
            event.start = req.body.start;
            event.end = req.body.end;
            event.location = req.body.location;
            event.details = req.body.details;

            // Update image if a new file is uploaded
            if (req.file) {
                // Delete the old image file if it exists
                if (event.image && fs.existsSync(path.join(__dirname, './public', event.image))) {
                    fs.unlinkSync(path.join(__dirname, './public', event.image));
                }
                event.image = '/img/' + req.file.filename;
            }

            return event.save();
        })
        .then(() => res.redirect('/events/' + id))
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                return res.redirect('back'); 
            }
            next(err);
        });
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    Event.findByIdAndDelete(id)
        .then(event => {
            if (event) {
                res.redirect('/events');
            } else {
                let err = new Error('Cannot delete event with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.createOrUpdateRSVP = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const userId = req.session.user._id;
        const status = req.body.status;

        const event = await Event.findById(eventId);
        if (event.hostName.equals(userId)) {
            return res.status(401).render('error', { error: new Error('You cannot RSVP for your own event') });
        }

        const rsvp = await RSVP.findOneAndUpdate(
            { user: userId, event: eventId },
            { status },
            { upsert: true, new: true }
        );

        const yesCount = await RSVP.countDocuments({ event: eventId, status: 'YES' });
        event.yesCount = yesCount;
        await event.save();

        res.redirect(`/events/${eventId}`);
    } catch (err) {
        next(err);
    }
};

