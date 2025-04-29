const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Middleware to verify JWT token
router.use(auth);

// Validation middleware
const validateTask = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot be more than 100 characters'),
  body('description').optional().trim()
    .isLength({ max: 500 }).withMessage('Description cannot be more than 500 characters'),
  body('category').isIn(['Personal', 'Work', 'Study', 'Health', 'Other'])
    .withMessage('Invalid category'),
  body('priority').isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid priority level'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Invalid status'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date format')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  body('reminder').optional().isISO8601().withMessage('Invalid reminder date format')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Reminder must be in the future');
      }
      return true;
    })
];

// Get all tasks with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, status, priority, dueDate } = req.query;
    const query = { user: req.user.id };

    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (dueDate) {
      const startDate = new Date(dueDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dueDate);
      endDate.setHours(23, 59, 59, 999);
      query.dueDate = { $gte: startDate, $lte: endDate };
    }

    const tasks = await Task.find(query).sort({ order: 1 });
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Create new task
router.post('/', validateTask, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const task = new Task({
      ...req.body,
      user: req.user.id
    });

    await task.save();
    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update task
router.put('/:id', validateTask, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Update task fields
    Object.keys(req.body).forEach(key => {
      task[key] = req.body[key];
    });

    // Update completedAt if status is changed to Completed
    if (req.body.status === 'Completed' && task.status !== 'Completed') {
      task.completedAt = new Date();
    }

    await task.save();
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update task order
router.put('/reorder', async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request format'
      });
    }

    const bulkOps = tasks.map((task, index) => ({
      updateOne: {
        filter: { _id: task._id, user: req.user.id },
        update: { $set: { order: index } }
      }
    }));

    await Task.bulkWrite(bulkOps);
    res.json({
      success: true,
      message: 'Tasks reordered successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get tasks by category
router.get('/category/:category', async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.id,
      category: req.params.category
    }).sort({ order: 1 });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks with due date
router.get('/due/:date', async (req, res) => {
  try {
    const startDate = new Date(req.params.date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(req.params.date);
    endDate.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      user: req.user.id,
      dueDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ order: 1 });
    
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 