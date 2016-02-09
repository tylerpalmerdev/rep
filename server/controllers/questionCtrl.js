var mongoose = require('mongoose'),
    q = require('q'),
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

  map: function(req, res) {
    var query = req.query;
    if (query.role === 'voter') {
      User.findOne({_id: query.voterId})
      .select('reps questions_answered')
      .exec(function(err, result) {
        if (err) {
          res.sendStatus(500, err);
        }
        Question
        .find({
          'submitted_by.rep_id': {$in: result.reps}
        })
        .populate('submitted_by.rep_id', 'first_name last_name bioguide_id title district state state_name')
        .exec(function(err, voterQs) {
          if (err) {
            res.sendStatus(500, err);
          }
          // for all questions answered by user:
          result.questions_answered.forEach(function(elem, i, arr) {
            // find that q in voterQs, assign answered bool & ans chosen num
            voterQs.forEach(function(qElem, qI, qArr) {
              if (qElem._id === elem._id) {
                qElem.answered = true;
                qElem.answer_chosen = elem.answer_chosen;
              }
            });
          });
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
        } else {
          res.send(qArr);
        }
      });
    }
  },
  answer: function(req, res) {
    /* BODY:
    {
      question_id: 'asdojkf8jasd98f',
      answer: 2,
      user_id: '099asg0asd'
    }
    */
    // var def = q.defer();
    //
    // req.send(def.promise);
    User.findOneAndUpdate({_id: req.body.user_id},
      {$push: {"questions_answered":
        {
          question_id: req.body.question_id,
          answer_chosen: req.body.answer_chosen
        }
      }},
      function(err, result) {
        if (err) {
          res.sendStatus(500, err);
        }
        res.send(result);
      }
    );
  }
};
