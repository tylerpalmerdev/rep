var mongoose = require('mongoose'),
    q = require('q'),
    Question = require('./../models/Question'),
    User = require('./../models/User');

module.exports = {
  create: function(req, res) {
    var question = new Question(req.body);
    question.save(function(err, result) { // pass result_id to emit function w/ sockets
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
        .populate('submitted_by.rep_id', 'first_name last_name bioguide_id title title_abbrev district state state_name')
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
      .populate('submitted_by.rep_id', 'first_name last_name bioguide_id title title_abbrev district state state_name')
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

    // need to make sure user hasn't already answered question AND answer is in range before saving/ updating either
    User.findOne(
      {
        _id: req.body.user_id,
        'questions_answered.question_id': {$ne: req.body.question_id}
        // ^^ this should prevent same user from answering same question twice
      },
      function(err, user) {
        if (err) {
          res.send(500).status(err);
        } else if (!user) { // if question already answered
          res.status(412).send("user already answered question!");
        } else {
          // set up query to find if provided answer exists for question
          var answer = req.body.answer_chosen;
          var questionQuery = {_id: req.body.question_id};
          questionQuery['options.' + answer] = {$exists: true};
          Question.findOne(questionQuery,
            function(err, questionResult) {
              if (err) {
                res.status(500).send(err);
              } else if (!questionResult) { // if questionResult index out of range:
                res.status(412).send("that answer is out of range.");
              } else {
                // if it passes all checks, update values and save
                // add questionResult answered object to user doc
                user.questions_answered.push(
                  {
                    question_id: req.body.question_id,
                    answer_chosen: req.body.answer_chosen
                  }
                );

                // create dynamic update object before updating question
                // based on answer chosen. will increment votes accordingly.
                var updateObj = {$inc: {total_responses: 1}};
                updateObj.$inc['options.' + answer + '.votes'] = 1;

                // use q to create promise that resolves when both resolve
                q.all([
                  questionResult.update(updateObj).exec(),
                  user.save()
                ])
                .then(
                  function(response) {
                    delete response[1].password;
                    res.send(response);
                  },
                  function(err) {
                    res.status(500).send("error saving records");
                  }
                );
              }
          });
        }
      }
    );
  }
};
