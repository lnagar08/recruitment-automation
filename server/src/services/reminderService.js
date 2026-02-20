const { Candidate, Agency } = require('../models');
const { sendNotification, notifyAgency } = require('./notificationService');
const { Op } = require('sequelize');

const processReminders = async () => {
    try {
        console.log('🔍 Checking for pending documents...');

        const pendingCandidates = await Candidate.findAll({
            where: {
                document_status: 'pending',
                reminder_count: { [Op.lt]: 3 } 
            },
            include: [{ model: Agency }] 
        });

        for (const candidate of pendingCandidates) {
            const agency = candidate.Agency;
            
            if (candidate.reminder_count < 3) {
                await sendNotification(candidate, agency, 'EMAIL');
                await candidate.increment('reminder_count');
            } 
            else if (candidate.reminder_count === 3) {
                await notifyAgency(candidate, agency, 'EMAIL');
                
                // change status to 'failed_reminder' to prevent further notifications
                await candidate.update({ document_status: 'failed_reminder' }); 
            }
        }
    } catch (error) {
        console.error('❌ Scheduler Error:', error.message);
    }
};

module.exports = { processReminders };
