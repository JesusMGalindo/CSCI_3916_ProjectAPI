const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String },
  priority:    { type: String, enum: ['low','medium','high'], default: 'medium' },
  dueDate:     { type: Date },
  isCompleted: { type: Boolean, default: false },
  status:      { type: String, enum: ['todo','doing','done','overdue'], default: 'todo' }
}, { timestamps: true });

TaskSchema.index({ userId: 1, dueDate: 1 });

module.exports = mongoose.model('Task', TaskSchema);
