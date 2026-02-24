const cron = require('node-cron');
const { Interview, Candidate, Agency, Log } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { sendNotification } = require('../services/notificationService');

const initInterviewReminders = () => {
    
    cron.schedule('*/5 * * * *', async () => {
        console.log('🕒 Checking for upcoming interviews (1-hour reminder)...');

        const upcoming = await Interview.findAll({
            where: { confirmation_status: 'confirmed' },
            include: [Candidate, Agency]
        });

        const now = moment();

        for (const interview of upcoming) {
            const interviewTime = moment(interview.interview_datetime, "DD/M/YYYY hh:mm A");

            const diffInMinutes = interviewTime.diff(now, 'minutes');

            if (diffInMinutes >= 55 && diffInMinutes <= 65) {
                const msg = `Reminder: Your interview with ${interview.company_name} is at ${interview.interview_datetime} (in 1 hour).`;
                
                await sendNotification(interview.Candidate, interview.Agency, 'BOTH', msg, `Upcoming Interview Reminder: ${interview.company_name} at ${interview.interview_datetime}`);
                
                await Log.create({
                    type: 'FINAL_ALERT',
                    candidate_id: interview.Candidate.id,
                    agency_id: interview.Candidate.agency_id,
                    status: 'SUCCESS',
                    message: `Final 1-hour reminder sent to ${interview.Candidate.email} for interview ID: ${interview.id}`
                });
                console.log(`✅ 1-hour reminder sent to ${interview.Candidate.name}`);
            }
        }
    });
};

module.exports = initInterviewReminders;
