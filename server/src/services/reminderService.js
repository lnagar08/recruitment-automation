const { Interview, Candidate, Agency } = require('../models');
const { notifyAgencyInterviewFailure, sendNotification, notifyAgency } = require('./notificationService');
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

const processInterviewReminders = async () => {
    try {
        const pendingInterviews = await Interview.findAll({
            where: {
                confirmation_status: 'pending',
                reminder_count: { [Op.lte]: 3 } 
            },
            include: [Candidate, Agency]
        });

        for (const interview of pendingInterviews) {
            const agency = interview.Agency;

            if (interview.reminder_count < 3) {
                
                const confirmLink = `${process.env.FRONTEND_URL}/confirm/${interview.uuid}`;
                const msg = `Reminder: Please confirm your interview with ${interview.company_name} on ${interview.interview_datetime}: ${confirmLink}`;
                
                await sendNotification(interview.Candidate, agency, 'EMAIL', msg);
                await interview.increment('reminder_count');
            } 
            else if (interview.reminder_count === 3) {
                
                await notifyAgencyInterviewFailure(interview, agency);
                
                await interview.update({ confirmation_status: 'failed_confirmation' });
            }
        }
    } catch (error) {
        console.error('❌ Interview Scheduler Error:', error);
    }
};


module.exports = { processReminders, processInterviewReminders };
