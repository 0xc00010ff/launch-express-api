//
//  _   _ ___  ___ _ __
// | | | / __|/ _ \ '__|
// | |_| \__ \  __/ |
//  \__,_|___/\___|_|
//

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const BCrypt = require('bcrypt');
const debug = require('debug')('app:models:user');

/*
  The user's password is based off a salted hash,
  this number determines how many 2^work times to run the salt hashing
  (for better security in bruce force attacks).
  DO NOT CHANGE IT
*/
var SALT_WORK_FACTOR = 7;
///DO NOT CHANGE AFTER PROD DEPLOYMENT


/**
* @description The User schema
*/
var userSchema = new Schema({
  username: { type: String, required: true, lowercase: true, index: { unique: true } },
  password: { type: String, required: true },
}, { timestamps: true } );

/**
* @description Hash the plaintext password when it changes
*/
userSchema.pre('save', function(next) {
  var user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();
  // generate a salt
  BCrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);
    // hash the password using new salt
    BCrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      // override the plaintext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

/**
* @description Bcrypt password comparison helper
*/
userSchema.methods.comparePassword = function(candidatePassword) {
  var self = this;
  var comparison = new Promise(function(resolve, reject) {
    BCrypt.compare(candidatePassword, self.password, function(err, isMatch) {
      if (err) return reject(err);
      else resolve(isMatch);
    });
  });
  return comparison;
};

// create model using schema
var User = Mongoose.model('User', userSchema);

/////////////////////
//	Exports
/////////////////////

module.exports = User;
