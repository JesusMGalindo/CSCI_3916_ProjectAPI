// models/tasks.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    userId: {                       // owner
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      required: true,
    },

    title:       { type: String, required: true },
    description: { type: String },

    priority: {
      type:    String,
      enum:    ['low', 'medium', 'high'],
      default: 'medium',
    },

    dueDate:     { type: Date },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }              // adds createdAt / updatedAt
);

/* ── VIRTUAL: isOverdue ─────────────────────────────────────────── */
TaskSchema.virtual('isOverdue').get(function () {
    return (
      !this.isCompleted &&
      this.dueDate instanceof Date &&
      this.dueDate.getTime() < Date.now()
    );
  });
  
/* ── STATIC: findOverdue() ──────────────────────────────────────── */
TaskSchema.statics.findOverdue = function (userId) {
    return this.find({
      userId,
      isCompleted: false,
      dueDate: { $lt: new Date() },
    });
  };

module.exports = mongoose.model('Task', TaskSchema);
