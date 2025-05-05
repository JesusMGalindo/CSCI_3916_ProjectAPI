const express  = require('express');
const morgan   = require('morgan');
const authRt   = require('./routes/auth');
const taskRt   = require('./routes/tasks');

const app = express();

// ── middleware
app.use(morgan('dev'));
app.use(express.json());

// ── routes
app.use('/api',       authRt);
app.use('/api/tasks', taskRt);

// ── 404 fallback
app.use((_, res) => res.status(404).json({ error: 'Route not found' }));

module.exports = app;
