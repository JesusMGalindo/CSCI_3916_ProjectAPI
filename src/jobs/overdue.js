require('dotenv').config();
require('../db');
const Task = require('../models/task');

(async function run() {
  const now   = new Date();
  const tasks = await Task.find({ isCompleted: false, dueDate: { $lt: now } });

  for (const t of tasks) {
    t.status = 'overdue';
    await t.save();
  }

  console.log(`Flagged ${tasks.length} task(s) as overdue`);
  process.exit();
})();
