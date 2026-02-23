const cron = require('node-cron');
const { Interview, Candidate, Agency } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { sendNotification } = require('../services/notificationService');

const initInterviewReminders = () => {
    
    cron.schedule('*/05 * * * *', async () => {
        console.log('🕒 Checking for upcoming interviews (1-hour reminder)...');

        
        const targetTimeStart = moment().add(55, 'minutes').toISOString();
        const targetTimeEnd = moment().add(65, 'minutes').toISOString();

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
                
                await sendNotification(interview.Candidate, interview.Agency, 'EMAIL', msg, `Upcoming Interview Reminder: ${interview.company_name} at ${interview.interview_datetime}`);
                console.log(`✅ 1-hour reminder sent to ${interview.Candidate.name}`);
            }
        }
    });
};

module.exports = initInterviewReminders;
