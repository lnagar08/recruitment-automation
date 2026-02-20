const cron = require('node-cron');
const { processReminders } = require('../services/reminderService');

const initSchedulers = () => {
    // Each day at 10:00 AM ('0 10 * * *') (server time) - Adjust as needed for timezone
    // for testing every 1 minute: '*/1 * * * *'
    cron.schedule('0 10 * * *', () => {
        console.log('⏰ Starting Daily Document Reminder Task...');
        processReminders();
    });

    console.log('✅ Cron Jobs Initialized');
};

module.exports = initSchedulers;
