const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high',
      },
      default: 'medium',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in_progress', 'completed'],
        message: 'Status must be todo, in_progress, or completed',
      },
      default: 'todo',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    dueTime: {
      type: String,
      default: null,
      validate: {
        validator(v) {
          return v == null || /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: 'dueTime must be HH:mm',
      },
    },
    recurringScheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringSchedule',
      default: null,
      index: true,
    },
    occurrenceDate: {
      type: String,
      default: null,
      validate: {
        validator(v) {
          return v == null || /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: 'occurrenceDate must be YYYY-MM-DD',
      },
    },
    isRecurringOccurrence: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index(
  { recurringScheduleId: 1, occurrenceDate: 1 },
  {
    unique: true,
    partialFilterExpression: {
      recurringScheduleId: { $type: 'objectId' },
      occurrenceDate: { $type: 'string' },
    },
  }
);

module.exports = mongoose.model('Task', taskSchema);
