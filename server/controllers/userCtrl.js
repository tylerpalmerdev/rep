var mongoose = require('mongoose');
var User = require('./../models/User');

module.exports = {
  register: function(req, res, next) {
    console.log('registering user');
    var newUser = new User(req.body);
    newUser.save(function(err, user) {
      if (err) {
        res.sendStatus(500, 'Registration failed');
      }
      res.send(user);
    });
  }
};
