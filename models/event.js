const mongoose = require('mongoose');
const Schema = mongoose.Schema

const eventSchema = new Schema({
    title: {type: String, required: [true, 'title is required']}, 
    category: {type: String, required: [true, 'category is required'], enum: ['Workshop', 'Networking', 'Seminar', 'Webinar', 'Other']}, 
    start: {type: Date, required: [true, 'time is required']}, 
    end: {type: Date, required: [true, 'time is required']}, 
    location: {type: String, required: [true, 'location is required']}, 
    details: {type: String, required: [true, 'details are required'], minlength: [10, 'the details should have at least 10 characters']}, 
    image: {type: String, required: [true, 'image is required']}, hostName: {type: Schema.Types.ObjectId, ref: 'User'},
    yesCount: { type: Number, default: 0 }
},
);

//collection name is events in the db
module.exports = mongoose.model('Event', eventSchema);
