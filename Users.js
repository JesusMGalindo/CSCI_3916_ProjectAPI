// models/Users.js
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');
Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

// User schema
const UserSchema = new Schema(
  {
    name:     String,
    username: { type: String, required: true, unique: true, index: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false }
  },
  { timestamps: true }
);

// Hash the password before save
UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  bcrypt.hash(this.password, null, null, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});

// Compare a password on login
UserSchema.methods.comparePassword = function (candidate, cb) {
  bcrypt.compare(candidate, this.password, (err, isMatch) => cb(err, isMatch));
};

module.exports = mongoose.model('User', UserSchema);
