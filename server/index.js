// require modules
var express = require('express'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    expressSession = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
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

// set up local login
passport.use('local-login', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // passes entire request to callback
  },
  function(req, email, password, done) {
    User.findOne({'email': email}, function(err, user) {
      // if server error
      if (err) {
        return done(err);
      }
      // if user not found
      if (!user) {
        return done('user not found', false);
      }
      // if user found, verify password
      user.verifyPassword(password, function(err, isMatch) {
        if (err) {
          return done('password verify failed', false);
        }
        if (!isMatch) {
          return done('wrong pw', false);
        }
        // if match: delete pw from user obj, return user object
        delete user.password;
        return done(null, user);
      });
  });
}));

// set up local signup
passport.use('local-signup', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // passes entire request to callback
  },
  function(req, email, password, done) {
    // search for user
    User.findOne({$or: [{'email': email}, {'bioguide_id': req.body.bioguide_id}]}, function(err, user) {
      // if server error
      if (err) {
        console.log(err);
        return done(err);
      }
      // if user already exists
      if (user) {
        if (user.bioguide_id === req.body.bioguide_id) {
          return done('Rep already has an account.', false);
        } else {
          return done('User already registered.', false);
        }
      }
      // if not, create new user from req.body:
      var newUser = new User(req.body);
      newUser.save(function(err, saved) {
        if (err) {
          return done('new user creation failed', false);
        }
        // auto log in new user if reg successful
        req.login(newUser, function(err) {
          if (err) {
            return done('User reg, but no login', saved);
          }
          return done(null, saved);
        });
      });
  });
}));

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

// signup endpoint
app.post('/signup', passport.authenticate('local-signup'), function(req, res) {
  res.send(req.user);
});

// auth endpoints
app.post('/login', passport.authenticate('local-login'), function(req, res) {
  res.send(req.user);
});

// register endpoints
app.post('/register', userCtrl.register);

// get current user Data
app.get('/currUser', function(req, res) {
  console.log(req.user);
  res.send(req.user);
});

app.get('/logout', function(req, res) {
  req.logout();
  req.session.destroy(function(err) {
    res.send('user logged out.');
  });
});

// reps endpoints
app.get('/reps', repCtrl.read);
app.get('/reps/:repId', repCtrl.map);
app.put('/reps', repCtrl.update);
