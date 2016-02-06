var mongoose = require('mongoose'),
    moment = require('moment');

var QuestionSchema = mongoose.Schema({
  text: {type: String, required: true, maxlength: 150},
  kind: {type: String, required: true, enum: ['yn', 'mc']},
  submitted_by: {type: mongoose.Schema.Types.ObjectId, ref: 'Rep', required: true},
  status: {type: String, required: true, enum: ['active', 'completed'], default: 'active'},
  submit_at: {type: Date, default: Date.now()},
  complete_at: {type: Date}, // + 3 days
  options: [{
    text: {type: String, maxlength: 50},
    votes: {type: Number, default: 0, min: 0}
  }]
});

// timestamp hook
QuestionSchema.pre('save', function(next) {
  var question = this;
  if (question.isNew) {
    // var now = moment();
    var eodThreeDays = moment().add(3, 'days').endOf('day');
    // submit_at = now;
    complete_at = eodThreeDays;
  }
  return next();
});

// another option: just use the ObjectId.getTimestamp() to get creation date of entry (less explicit)

// y/n options hook
QuestionSchema.pre('save', function(next) {
  var question = this;
  if (question.kind === 'yn') {
    question.options = [{text: 'Yes'}, {text: 'No'}];
  }
  return next();
});

// method to update questions with complete_stamps in past to 'complete' status. Or, should this live in controller? Will be run daily.

module.exports = mongoose.model('Question', QuestionSchema);
