// models/Notifications.js
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const NotificationSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },

    type:   { type: String, enum: ['dueSoon', 'overdue'], required: true },
    sentAt: { type: Date, default: Date.now },

    // optional: mark whether the user has already dismissed the alert
    read:   { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
