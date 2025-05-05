const passport      = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const jwt           = require('jsonwebtoken');
const User          = require('./Users');

const JWT_SECRET = process.env.SECRET_KEY || 'supersecret';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'), // "Authorization: JWT <token>"
  secretOrKey: JWT_SECRET,
};


passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      return done(null, user || false);
    } catch (err) {
      return done(err, false);
    }
  })
);

exports.issueToken = (user) =>
  jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
    expiresIn: '7d',
  });

exports.isAuthenticated = passport.authenticate('jwt', { session: false });
exports.secret = JWT_SECRET;
