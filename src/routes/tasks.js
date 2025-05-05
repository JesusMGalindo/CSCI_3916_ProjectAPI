const router  = require('express').Router();
const jwtLib  = require('jsonwebtoken');
const jwtUtil = require('../utils/auth_jwt');
const Task    = require('../models/task');

// ── JWT auth middleware
router.use((req, res, next) => {
  const auth  = req.headers.authorization || '';
  const token = auth.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwtLib.verify(token, jwtUtil.secret);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ── GET /api/tasks  (optional filters)
router.get('/', async (req, res) => {
  const filter = { userId: req.user.sub, ...req.query };
  const tasks  = await Task.find(filter).sort({ dueDate: 1 });
  res.json(tasks);
});

// ── POST /api/tasks
router.post('/', async (req, res) => {
  const task = await Task.create({ ...req.body, userId: req.user.sub });
  res.status(201).json(task);
});

// ── PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.sub },
    req.body,
    { new: true }
  );
  if (!task) return res.status(404).end();
  res.json(task);
});

// ── DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  await Task.deleteOne({ _id: req.params.id, userId: req.user.sub });
  res.status(204).end();
});

module.exports = router;
