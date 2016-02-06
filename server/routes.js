var passport = require('passport'),
    userCtrl = require('./controllers/userCtrl'),
    repCtrl = require('./controllers/repCtrl');

require('./config/passport')(passport);

module.exports = function(app) {
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
    res.send(req.user);
  });

  app.get('/logout', function(req, res) {
    req.session.destroy();
    req.logout();
    res.send('user logged out.');
  });

  // reps endpoints
  app.get('/reps', repCtrl.read);
  app.get('/reps/:repId', repCtrl.map);
  app.put('/reps', repCtrl.update);
};
