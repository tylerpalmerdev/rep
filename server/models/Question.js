var mongoose = require('mongoose'),
    moment = require('moment');

var optionSchema = mongoose.Schema(
  {
    text: {type: String, maxlength: 50},
    votes: {type: Number, default: 0, min: 0}
  }, { _id: false });

var questionSchema = mongoose.Schema({
  text: {type: String, required: true, maxlength: 150},
  kind: {type: String, required: true, enum: ['yn', 'mc']},
  submitted_by: { // denormalizing this for easy querying
    rep_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Rep', required: true},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
  },
  status: {type: String, required: true, enum: ['active', 'completed'], default: 'active'},
  submit_at: {type: Date, default: moment()},
  complete_at: {type: Date, default: moment().add(3, 'days').endOf('day')}, // + 3 days
  options: [optionSchema]
});

// y/n options hook
questionSchema.pre('save', function(next) {
  var question = this;
  if (question.kind === 'yn') {
    question.options = [{text: 'Yes'}, {text: 'No'}];
  }
  return next();
});

// method to update questions with complete_at in past to 'complete' status. Or, should this live in controller? Will be run daily.

module.exports = mongoose.model('Question', questionSchema);
