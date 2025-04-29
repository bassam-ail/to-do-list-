const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    enum: {
      values: ['Personal', 'Work', 'Study', 'Health', 'Other'],
      message: 'Invalid category'
    },
    default: 'Personal'
  },
  priority: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High'],
      message: 'Invalid priority level'
    },
    default: 'Medium'
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'In Progress', 'Completed'],
      message: 'Invalid status'
    },
    default: 'Pending'
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  reminder: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Reminder must be in the future'
    }
  },
  order: {
    type: Number,
    default: 0
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, category: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, createdAt: -1 });

// Virtual for task age
taskSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to check if task is overdue
taskSchema.methods.isOverdue = function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'Completed';
};

module.exports = mongoose.model('Task', taskSchema); 