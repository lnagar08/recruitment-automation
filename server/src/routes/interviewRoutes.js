const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

router.post('/schedule', interviewController.scheduleInterview);
router.get('/confirm/:interview_id', interviewController.confirmInterview);
router.put('/reschedule/:interview_id', interviewController.rescheduleInterview);

module.exports = router;
