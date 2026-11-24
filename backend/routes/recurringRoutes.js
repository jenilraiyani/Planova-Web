const express = require('express');
const {
  generateOccurrences,
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  pauseSchedule,
  resumeSchedule,
  deleteSchedule,
} = require('../controllers/recurringController');

const router = express.Router();

router.post('/generate', generateOccurrences);
router.route('/').get(getSchedules).post(createSchedule);
router.patch('/:id/pause', pauseSchedule);
router.patch('/:id/resume', resumeSchedule);
router.route('/:id').get(getSchedule).put(updateSchedule).delete(deleteSchedule);

module.exports = router;
