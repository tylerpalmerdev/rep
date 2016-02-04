var mongoose = require('mongoose');
var Rep = require('./../models/Rep');

var resFunc = function(err, result) {
  if (err) {
    res.sendStatus(500, err);
  }
  res.send(result);
};

module.exports = {
  read: function(req, res) {
    Rep.find({})
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
    Rep.find({bioguide_id: id}, function(err, result) {
      if (err) {
        res.sendStatus(500, err);
      }
      res.send(result);
    });
  }
};
