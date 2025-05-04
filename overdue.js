/* jobs/overdueNotifier.js
 * Hourly cron: send email + create Notification once per overdue task
 */
require('dotenv').config();
const cron        = require('node-cron');
const { connect } = require('../db');

const Task         = require('../tasks');
const User         = require('../Users');
const Notification = require('../notifications');
const { sendEmail } = require('../services/email');

(async () => {
  await connect();
  console.log('[cron] Over‑due notifier running');

  // every hour, on the hour
  cron.schedule('0 * * * *', async () => {
    const overdue = await Task.find({
      isCompleted: false,
      dueDate: { $lt: new Date() }
    });

    for (const task of overdue) {
      // skip if already notified
      const already = await Notification.exists({ taskId: task._id, type: 'overdue' });
      if (already) continue;

      const user = await User.findById(task.userId);
      if (!user?.email) continue;

      // Send email
      await sendEmail(
        user.email,
        `Task overdue: ${task.title}`,
        `Hi ${user.name || user.username},

Your task "${task.title}" was due on ${task.dueDate.toDateString()}.

— Chapter 22 Task Manager`
      );

      // Record notification
      await Notification.create({
        userId: user._id,
        taskId: task._id,
        type:   'overdue'
      });

      console.log(`[cron] notified ${user.username} about "${task.title}"`);
    }
  });
})();
