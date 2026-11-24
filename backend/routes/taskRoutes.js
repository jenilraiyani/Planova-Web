const express = require('express');
const {
  getTasks,
  getTodayTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  deleteAllTasks,
} = require('../controllers/taskController');

const router = express.Router();

router.route('/').get(getTasks).post(createTask).delete(deleteAllTasks);
router.get('/today', getTodayTasks);
router.patch('/:id/status', updateTaskStatus);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);

module.exports = router;
