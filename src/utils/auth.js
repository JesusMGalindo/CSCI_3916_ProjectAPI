const passport      = require('passport');
const { BasicStrategy } = require('passport-http');
const bcrypt        = require('bcrypt-nodejs');
const User          = require('./Users');


passport.use(
  new BasicStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username }).select('+password'); // need hash
      if (!user) return done(null, false);

      user.comparePassword(password, (err, isMatch) => {
        if (err || !isMatch) return done(null, false);
        
        user.password = undefined;
        return done(null, user);
      });
    } catch (err) {
      return done(err);
    }
  })
);

exports.isAuthenticated = passport.authenticate('basic', { session: false });
