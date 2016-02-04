var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs');

var UserSchema = mongoose.Schema({
  email: {type: String, required: true},
  hash: {type: String, required: true},
  role: {type: String, required: true, enum: [
    'rep',
    'voter',
    'admin'
  ]},
  name: {type: String, required: true},
  addressData: {type: Object},
  district: {type: Object}
  // questions_asked: [
  //   {
  //     question_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Question'}
  //   },
  // ],
  // questions_answered: [
  //   {
  //     question_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Question'},
  //     answer_chosen: {type: Number, enum: [1, 2, 3, 4, 5]}
  //   }
  // ]
});

UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.pre('save', function(next) {
  var user = this;
});

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
