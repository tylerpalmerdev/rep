// require modules
var express = require('express'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    expressSession = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
    cookieParser = require('cookie-parser'),
    logger = require('morgan');

// internal modules
var config = require('./config/config'),
    repCtrl = require('./controllers/repCtrl'),
    User = require('./models/User'),
    userCtrl = require('./controllers/userCtrl');

// set up express & start app
var app = express();
var port = 9000;

// set up module middleware
var corsOptions = {
	origin: 'http://localhost' + port
};
app.use(logger('dev')); // logs any request made
app.use(cors(corsOptions));
app.use(express.static(__dirname + '/../public')); // serves up front end files
app.use(bodyParser.json()); // parses any body into json
app.use(bodyParser.urlencoded({extended: false}));

// set up session
app.use(expressSession({
  secret: config.session_secret,
  resave: true,
  saveUninitialized: false
}));

// configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// config passport-local to use User model for auth
// passport.use(User.createStrategy());

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    console.log("user serialized:", user);
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    console.log("ID", id);
    User.findById(id, function(err, user) {
      if (err) {
        return done(err);
      }
      done(null, user);
    });
});

// set up local signup
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // passes entire request to callback
  },
  function(req, email, password, done) {
    User.findOne({'email': email}, function(err, user) {
      // if server error
      if (err) {
        console.log(err);
        return done(err);
      }
      // if user not found
      if (!user) {
        return done('user not found', false);
      }
      // if user found, verify password
      user.verifyPassword(password)
      .then(
        function(isMatch) {
          if (!isMatch) {
            return done('Credentials invalid.', false);
          }
          return done(null, user);
        }
      )
    })
  }

));

// start app listening
app.listen(port, function() {
  console.log('listening on port', port);
});

// set up & connect to mongolab db
var dbUri = config.dbUri;
mongoose.connect(dbUri);
mongoose.connection.once('open', function() {
  console.log('MongoDB connected.');
});


// auth endpoint
app.post('/auth', passport.authenticate('local-signup', {
  successRedirect: '/rep',
  failureRedirect: '/login'
}));

// register endpoints
app.post('/register', userCtrl.register);

// reps endpoints
app.get('/reps', repCtrl.read);
app.get('/reps/:repId', repCtrl.map);
app.put('/reps', repCtrl.update);
