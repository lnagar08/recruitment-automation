const cron = require('node-cron');
const { Interview, Candidate, Agency } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment'); // समय कैलकुलेशन के लिए 'npm install moment' करें
const { sendNotification } = require('../services/notificationService');

const initInterviewReminders = () => {
    // हर 15 मिनट में चेक करें
    cron.schedule('*/15 * * * *', async () => {
        console.log('🕒 Checking for upcoming interviews (1-hour reminder)...');

        // वर्तमान समय से 1 घंटा बाद का समय
        const targetTimeStart = moment().add(55, 'minutes').toISOString();
        const targetTimeEnd = moment().add(65, 'minutes').toISOString();

        const upcoming = await Interview.findAll({
            where: {
                confirmation_status: 'confirmed',
                interview_datetime: {
                    [Op.between]: [targetTimeStart, targetTimeEnd]
                }
            },
            include: [Candidate, Agency]
        });

        for (const interview of upcoming) {
            const msg = `Reminder: Your interview with ${interview.company_name} is in 1 hour!`;
            await sendNotification(interview.Candidate, interview.Agency, 'BOTH', msg);
            console.log(`⏰ 1-hour reminder sent to ${interview.Candidate.name}`);
        }
    });
};

module.exports = initInterviewReminders;
