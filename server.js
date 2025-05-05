require('dotenv').config();                // .env → process.env

const express        = require('express');
const bodyParser     = require('body-parser');
const passport       = require('passport');
const jwt            = require('jsonwebtoken');
const cors           = require('cors');

const authController     = require('./auth');        
const authJwtController  = require('./auth_jwt');    
const { connect }        = require('./db');          
const User               = require('./Users');
const Task               = require('./tasks');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

/* ------------------------------------------------------------------ *
 *  Open MongoDB FIRST, then mount routes                             *
 * ------------------------------------------------------------------ */
(async () => {
  await connect();

  const router = express.Router();

  /* ========================  AUTH  ================================= */

  // POST /signup
  router.post('/signup', async (req, res) => {
    const { username, email, password, name } = req.body;
    if (!username || !email || !password) {
      return res.json({ success: false, msg: 'Please include username, email and password.' });
    }

    try {
      const user = new User({ username, email, password, name });
      await user.save();
      res.json({ success: true, msg: 'User created.' });
    } catch (err) {
      if (err.code === 11000) {
        return res.json({ success: false, msg: 'Username or email already exists.' });
      }
      res.status(500).json(err);
    }
  });

  // POST /signin
  router.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select('+password');

    if (!user) return res.status(401).json({ success: false, msg: 'Authentication failed.' });

    user.comparePassword(password, (err, isMatch) => {
      if (!isMatch) return res.status(401).json({ success: false, msg: 'Authentication failed.' });
      const userToken = { id: user.id, username: user.username };
      const token = jwt.sign(userToken, authJwtController.secret);
      res.json({ success: true, token: 'JWT ' + token });
    });
  });

  /* ========================  TASKS  ================================ */
  router.route('/tasks')
  // ── GET  /tasks  ?priority=high&completed=true ────────────────
  .get(authJwtController.isAuthenticated, async (req, res) => {
    const q = { userId: req.user.id };

    if (req.query.priority)   q.priority   = req.query.priority;      // low|medium|high
    if (req.query.completed)  q.isCompleted = req.query.completed === 'true';

    try {
      const tasks = await Task.find(q).sort({ dueDate: 1, priority: -1 });
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  })

  // ── POST  /tasks  ───────────────────────────────────────────────
  .post(authJwtController.isAuthenticated, async (req, res) => {
    if (!req.body.title) {
      return res.status(400).json({ success: false, msg: 'Missing task title.' });
    }
    try {
      const newTask = new Task({ ...req.body, userId: req.user.id });
      await newTask.save();
      res.status(201).json({ success: true, task: newTask });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error saving task.' });
    }
  });

  router.route('/tasks/:id')
  // ── GET  /tasks/:id  ────────────────────────────────────────────
  .get(authJwtController.isAuthenticated, async (req, res) => {
    try {
      const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
      if (!task) return res.status(404).json({ success: false, msg: 'Task not found.' });
      res.json(task);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  })

  // ── PUT  /tasks/:id  (full replace) ─────────────────────────────
  .put(authJwtController.isAuthenticated, async (req, res) => {
    try {
      const updatedTask = await Task.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        req.body,
        { new: true }
      );
      if (!updatedTask) return res.status(404).json({ success: false, msg: 'Task not found.' });
      res.json({ success: true, task: updatedTask });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  })
  // ── DELETE  /tasks/:id  ─────────────────────────────────────────
  .delete(authJwtController.isAuthenticated, async (req, res) => {
    try {
      const result = await Task.deleteOne({ _id: req.params.id, userId: req.user.id });
      if (result.deletedCount === 0)
        return res.status(404).json({ success: false, msg: 'Task not found.' });
      res.json({ success: true, msg: 'Task deleted.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  /* ---- PATCH  /tasks/:id/complete  ---------------------------------- */
  /* Mark / un‑mark a task as completed. Body optional:
      { "isCompleted": true }  // default = true
  */
  router.patch(
    '/tasks/:id/complete',
    authJwtController.isAuthenticated,
    async (req, res) => {
      const done = req.body.isCompleted ?? true;          // default → true
      try {
        const task = await Task.findOneAndUpdate(
          { _id: req.params.id, userId: req.user.id },
          { isCompleted: done },
          { new: true }
        );

        if (!task)
          return res.status(404).json({ success: false, msg: 'Task not found.' });

        res.json({ success: true, task });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    }
  );
  /* ========================  OVERDUE  ====================== */
  router.get('/overdue',
    authJwtController.isAuthenticated,
    async (req, res) => {
      const overdue = await Task.findOverdue(req.user.id).sort({ dueDate: 1 });
      res.json(overdue);
    });  

  /* ========================  REGISTER ROUTER  ====================== */
  app.use('/', router);

  /* ========================  START SERVER  ========================= */
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`Task‑Manager API listening on ${PORT}`));
})();


/* For Mocha/Chai testing (optional) */
module.exports = app;
