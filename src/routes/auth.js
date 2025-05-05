const router = require('express').Router();
const User   = require('../models/User');
const jwt    = require('../utils/auth_jwt');

// ── signup
router.post('/signup', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ token: jwt.issueToken(user) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── signin
router.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ error: 'Invalid credentials' });

  res.json({ token: jwt.issueToken(user) });
});

module.exports = router;
