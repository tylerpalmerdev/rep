var mongoose = require('mongoose');
var Rep = require('./../models/Rep');

module.exports = {
  read: function(req, res) {
    Rep
    .find({})
    .select('bioguide_id _id title state first_name last_name')
    .exec(function(err, result) {
      if (err) {
        res.sendStatus(500, err);
      }
      res.send(result);
    });
  },
  update: function(req, res) {
    var now = new Date().getTime().toString();
    Rep.update({}, {$set: {updated_at: now}}, {multi: true}, function(err, result) {
      if (err) {
        res.sendStatus(500, err);
      }
      res.send(result);
    });
  },
  map: function(req, res) {
    var id = req.params.repId;
    Rep
    .find({_id: id}, function(err, result) {
      if (err) {
        res.sendStatus(500, err);
      }
      res.send(result);
    });
  },
  getRepsForDist: function(distObj) {
    return Rep.find({state: distObj.state})
    .or([
      { $and: [{title: 'Representative'}, {district: distObj.district}]},
      {title: 'Senator'}
    ])
    .select('_id')
    .exec(
      function(err, results) {
        if (err) {
          return err;
        }
        return results;
      }
    );
  },
  setRepActiveAccount: function(repId, bool) {
    return Rep.findByIdAndUpdate(repId, {$set: {active_account: bool}}, function(err, result) {
      if (err) {
        return err;
      }
      return result;
    });
  }
};
