var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs');

var UserSchema = mongoose.Schema({
  email: {type: String, required: true},
  password: {type: String, required: true},
  role: {type: String, required: true, enum: [
    'rep',
    'voter',
    'admin'
  ]},
  name: {type: String, required: true},
  addressData: {type: Object},
  district: {type: Object},
  bioguide_id: {type: String} // only for reps, bioguide_id
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


// this middleware to has pws will run before any user save of occurs
UserSchema.pre('save', function(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  // generate salt to encrypt password with
  bcrypt.genSalt(10, function(err, salt) {
    // if salt generation fails
    if (err) {
      return next(err);
    }
    // if not, generate hash and save to user
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});

// checking if password is valid
UserSchema.methods.verifyPassword = function(password, callback) {
    // compare password provided with stored password for user
    bcrypt.compare(password, this.password, function(err, isMatch) {
      // if error, callback error
      if (err) {
        console.log('error comparing password.');
        return callback(err);
      }
      callback(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);
