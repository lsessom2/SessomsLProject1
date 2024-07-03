const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rsvpSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    status: { 
        type: String, 
        required: true, 
        enum: ['YES', 'NO', 'MAYBE']
    }
}, { timestamps: true });

const RSVP = mongoose.model('RSVP', rsvpSchema);
module.exports = RSVP;
