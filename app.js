const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const eventRoutes = require('./routes/eventRoutes');
const mainRoutes = require('./routes/mainRoutes');
const authRoutes = require('./routes/authRoutes');
const mongoose = require('mongoose');
const multer = require('multer');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const User = require('./models/user');
// const path = require('path');

// Create app
const app = express();

// Configure app
let port = 3000;
let host = 'localhost';
let url = 'mongodb+srv://Adultapp:adult123@atlascluster.nywqjho.mongodb.net/nbda-project3?retryWrites=true&w=majority&appName=AtlasCluster';
app.set('view engine', 'ejs');

// Connect to mongoose database
mongoose.connect(url)
    .then(() => {
        // Start server
        app.listen(port, host, () => {
            console.log('The server is running at port', port);
        });
    })
    .catch(err => console.log(err.message));

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

app.use(session({
    secret: 'whfuef2383hr832r8rh2h', 
    resave: false,
    saveUninitialized: false,
    cookie:{maxAge: 60*60*1000}, 
    store: new MongoStore({mongoUrl: url})
}));

app.use(flash());

app.use((req, res, next)=>{
    // console.log(req.session);
    res.locals.successMessages = req.flash('success');
    res.locals.errorMessages = req.flash('error');
    res.locals.currentUser = req.session.user;
    next();
});

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });


app.post('/', upload.single('file'), (req, res, next) => {
    const image = "./img/" + req.file.filename;
    res.render('index', { image });
});

//Routes
app.use('/', mainRoutes);
app.use('/events', eventRoutes);
app.use('/auth', authRoutes); 


app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if (!err.status) {
        err.status = 500;
        err.message = "Internal Error";
    }
    res.status(err.status);
    res.render('error', { error: err });
});





