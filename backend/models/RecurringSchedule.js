const mongoose = require('mongoose');

const FREQUENCIES = [
  'daily',
  'weekdays',
  'weekends',
  'weekly',
  'custom_days',
  'monthly',
  'custom_interval',
];

const recurringScheduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
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
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    frequency: {
      type: String,
      enum: {
        values: FREQUENCIES,
        message: `Frequency must be one of: ${FREQUENCIES.join(', ')}`,
      },
      required: [true, 'Frequency is required'],
    },
    selectedDays: {
      type: [Number],
      default: [],
      validate: {
        validator(days) {
          return days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6);
        },
        message: 'selectedDays must contain integers 0-6 (Sun-Sat)',
      },
    },
    interval: {
      type: Number,
      default: 1,
      min: [1, 'Interval must be at least 1'],
    },
    intervalUnit: {
      type: String,
      enum: ['days', 'weeks'],
      default: 'days',
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
      default: 1,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    dueTime: {
      type: String,
      default: '09:00',
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'dueTime must be HH:mm'],
    },
    endDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  { timestamps: true }
);

recurringScheduleSchema.index({ isActive: 1 });
recurringScheduleSchema.index({ startDate: 1 });

module.exports = mongoose.model('RecurringSchedule', recurringScheduleSchema);
module.exports.FREQUENCIES = FREQUENCIES;
