var mongoose = require('mongoose');
var User = require('./../models/User');

module.exports = {
  read: function(req, res) {
    if (!req.user) {
      res.send("")
    }
    var userId = req.user._id;
    if (req.user.role === 'voter') {
      User
      .findOne({_id: userId})
      .populate('reps', 'first_name last_name bioguide_id title district state state_name party active_account')
      .select('-password -addressData')
      .exec(function(err, user) {
        if (err) {
          res.sendStatus(500, err);
        }
        res.send(user);
      })
    } else if (req.user.role === 'rep') {
      User
      .findOne({_id: userId})
      .populate('rep_id', 'first_name last_name bioguide_id title district state active_account facebook_id contact_form oc_email office party phone state_name term_end term_start twitter_id website')
      .select('-password, -reps')
      .exec(function(err, user) {
        if (err) {
          res.sendStatus(500, err);
        }
        res.send(user);
      });
    }
  }
};
