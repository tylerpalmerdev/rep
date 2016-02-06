var mongoose = require('mongoose'),
    Question = require('./../models/Question');

module.exports = {
  create: function(req, res) {
    var question = new Question(req.body);
    question.save(function(err, result) {
      if (err) {
        res.sendStatus(500, err);
      }
      res.send(result);
    });
  }
};
