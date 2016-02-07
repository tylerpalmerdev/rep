var mongoose = require('mongoose'),
    Question = require('./../models/Question'),
    User = require('./../models/User');

module.exports = {
  create: function(req, res) {
    var question = new Question(req.body);
    question.save(function(err, result) {
      if (err) {
        res.sendStatus(500, err);
      }
      res.send(result);
    });
  },
  read: function(req, res) {
    var query = req.query;
    if (query.role === 'voter') {
      User.findOne({id: query.userId})
      .select('reps')
      .exec(function(err, repsArr) {
        if (err) {
          res.sendStatus(500, err);
        }
        Question
        .find({
          'submitted_by.rep_id': {$in: repsArr}
        })
        .exec(function(err, voterQs) {
          if (err) {
            res.sendStatus(500, err);
          }
          res.send(voterQs);
        });
      });
    } else if (query.role === 'rep') {
      // get all questions asked by rep
    }
  }
};
