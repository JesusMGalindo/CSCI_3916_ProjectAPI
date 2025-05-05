const jwt    = require('jsonwebtoken');
const SECRET = process.env.SECRET_KEY;

exports.secret     = SECRET;
exports.issueToken = user => {
  const payload = { sub: user._id, username: user.username };
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
};
