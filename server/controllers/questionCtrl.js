var mongoose = require('mongoose'),
    Question = require('./../models/Question'),
    User = require('./../models/User');

module.exports = {
  create: function(req, res) {
    var question = new Question(req.body);
    question.save(function(err, result) {
      if (err) {
        console.log(err);
        res.sendStatus(500, err);
      }
      res.send(result);
    });
  },

  read: function(req, res) {
    var query = req.query;
    console.log(query);
    if (query.role === 'voter') {
      User.findOne({_id: query.voterId})
      .select('reps')
      .exec(function(err, result) {
        if (err) {
          res.sendStatus(500, err);
        }
        Question
        .find({
          'submitted_by.rep_id': {$in: result.reps}
        })
        .exec(function(err, voterQs) {
          if (err) {
            res.sendStatus(500, err);
          }
          res.send(voterQs);
        });
      });
    } else if (query.role === 'rep') {
      Question
      .find(
        {'submitted_by.rep_id': query.repId}
      )
      .exec(function(err, qArr) {
        if (err) {
          res.sendStatus(500, err);
        } else if (qArr.length === 0) {
          res.sendStatus(401, 'no questions found for rep');
        } else {
          res.send(qArr);
        }
      });
    }
  }
};
