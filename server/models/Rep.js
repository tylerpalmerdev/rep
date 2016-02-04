var mongoose = require('mongoose');

var RepSchema = mongoose.Schema({
  active_account: {type: Boolean, required: true, default: false},
  bioguide_id : {type: String, required: true},
  birthday: {type: String},
  chamber : {type: String, required: true},
  contact_form : {type: String},
  crp_id : {type: String},
  district : {type: Number},
  facebook_id : {type: String},
  fax : {type: Number},
  fec_ids : [
      {type: String}
  ],
  first_name : {type: String, required: true},
  gender : {type: String, required: true, enum: ["M", "F"]},
  govtrack_id : {type: String},
  icpsr_id : {type: Number},
  in_office : {type: Boolean, required: true},
  last_name : {type: String, required: true},
  leadership_role : {type: String},
  lis_id: {type: String},
  middle_name : {type: String},
  name_suffix : {type: String},
  nickname : {type: String},
  oc_email : {type: String},
  ocd_id : {type: String},
  office : {type: String},
  party : {type: String, max: 1},
  phone : {type: String},
  senate_class : {type: Number},
  state : {type: String},
  state_name : {type: String},
  state_rank : {type: String},
  term_end : {type: String},
  term_start : {type: String},
  thomas_id : {type: String},
  title : {type: String, required: true},
  twitter_id : {type: String},
  updated_at: {type: Number},
  votesmart_id : {type: Number},
  website : {type: String},
  youtube_id: {type: String}
});

RepSchema.pre('update', function(next) {
  var rep = this;
  rep.updated_at = new Date().getTime();
  next();
});

module.exports = mongoose.model('Rep', RepSchema, 'reps');
