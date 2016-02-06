// require modules
var express = require('express'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    expressSession = require('express-session'),
    passport = require('passport'),
    logger = require('morgan');
    dotenv = require('dotenv').config();

// set up express & start app
var app = express();
var port = process.env.APP_PORT;

// set up middleware
var corsOptions = {
	origin: 'http://localhost' + port
};
app.use(logger('dev')); // logs any request made
app.use(cors(corsOptions));
app.use(express.static(__dirname + '/../public')); // serves up front end files
app.use(bodyParser.json()); // parses any body into json
app.use(bodyParser.urlencoded({extended: false}));

// enable/config express session
app.use(expressSession({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false
}));

// configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// import endpoints file, initialized to express app
var routes = require('./routes')(app);

// set up & connect to mongolab db
var dbUri = process.env.PROD_DB_URI;
mongoose.connect(dbUri);
mongoose.connection.once('open', function() {
  console.log('MongoDB connected.');
});

// start app listening
app.listen(port, function() {
  console.log('listening on port', port);
});
