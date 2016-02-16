var passport = require('passport'),
    userCtrl = require('./controllers/userCtrl'),
    repCtrl = require('./controllers/repCtrl'),
    questionCtrl = require('./controllers/questionCtrl');

require('./config/passport')(passport);

module.exports = function(app, io) {
  // signup endpoint
  app.post('/signup', passport.authenticate('local-signup'), function(req, res) {
    res.send(req.user);
  });

  // auth endpoints
  app.post('/login', passport.authenticate('local-login'), function(req, res) {
    res.send(req.user);
  });

  // get current user Data
  app.get('/currUser', userCtrl.read);

  app.get('/logout', function(req, res) {
    req.session.destroy();
    req.logout();
    res.send('user logged out.');
  });

  // reps endpoints
  app.get('/reps', repCtrl.read);
  app.get('/reps/:repId', repCtrl.map);
  app.put('/reps', repCtrl.update);

  // user endpoints
  app.get('/user/:userId', userCtrl.read);

  // question endpoints
  app.post('/questions', questionCtrl.create, function(req) {
    console.log("new q created with ", req.newQData);
    io.sockets.emit('newQuestion', req.newQData);
  });

  app.get('/questions', questionCtrl.map); // extra data in query string
  app.post('/answers', questionCtrl.answer, function(req) {
    io.sockets.emit('questionAnswered', req.answerData);
  });
};
