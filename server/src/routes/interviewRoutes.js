const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const auth = require('../middlewares/authMiddleware');

router.post('/schedule', auth, interviewController.scheduleInterview);
router.put('/reschedule/:interview_id', auth, interviewController.rescheduleInterview);
router.get('/confirm/:interview_uuid', interviewController.confirmInterview);
router.put('/updateschedule/:interview_uuid', interviewController.updateSchedule);

module.exports = router;
