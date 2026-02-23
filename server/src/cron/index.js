const cron = require('node-cron');
const { processReminders } = require('../services/reminderService');
const { processInterviewReminders } = require('../services/reminderService');
const initInterviewReminders = require('./interviewCron');

const initSchedulers = () => {
    // Each day at 10:00 AM ('0 10 * * *') (server time) - Adjust as needed for timezone
    // for testing every 1 minute: '*/1 * * * *'
    cron.schedule('0 10 * * *', () => {
        console.log('⏰ Starting Daily Document Reminder Task...');
        processReminders();
    });

    // Every 4 hours to check for unconfirmed interviews
    // for testing every 1 minute: '*/1 * * * *'
    cron.schedule('0 */4 * * *', () => {
        console.log('⏰ Starting Interview Confirmation Reminders...');
        processInterviewReminders();
    });

    initInterviewReminders(); // Interview reminders before 1 hour

    console.log('✅ Cron Jobs Initialized');
};

module.exports = initSchedulers;
