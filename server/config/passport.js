// import local strategy & user model
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User');

// module.export this function for use in server file
module.exports = function(passport) {

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
      done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
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
      var newUser = new User(req.body);
      // if request is to make a new rep account
      if (newUser.bioguide_id && newUser.role === 'rep') {
        User.findOne({'bioguide_id': req.body.bioguide_id}, function(err, user) {
          if (err) {
            return done(err);
          } else if (user) {
            return done('rep already has account', false);
          }
        });
      }
      // check if email exists for any account type being created
      User.findOne({'email': email}, function(err, user) {
        // if server error
        if (err) {
          console.log(err);
          return done(err);
        }
        // if user already exists with that email, reject request
        if (user) {
          return done('User already exists with that email', false);
        }
        // if not, create new user from newUser obj (req.body)
        newUser.save(function(err, saved) {
          if (err) {
            return done('new user creation failed', false);
          }
          // auto log in new user if reg successful
          req.login(newUser, function(err) {
            if (err) {
              return done('User reg, but no login', saved);
            }
            // delete pw from object before returning
            delete saved.password;
            return done(null, saved);
          });
        });
      });
  }));
}; // END OF FILE
