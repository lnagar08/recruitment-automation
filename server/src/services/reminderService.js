const { Interview, Candidate, Agency, Log } = require('../models');
const { notifyAgencyInterviewFailure, sendNotification, notifyAgency } = require('./notificationService');
const { Op } = require('sequelize');

const processReminders = async () => {
    try {
        console.log('🔍 Checking for pending documents...');

        const pendingCandidates = await Candidate.findAll({
            where: {
                document_status: 'pending',
                reminder_count: { [Op.lte]: 3 } 
            },
            include: [{ model: Agency }] 
        });
        
        for (const candidate of pendingCandidates) {
            
            const agency = candidate.Agency;

            const currentCount = parseInt(candidate.reminder_count);

            if (currentCount < 3) {

                const uploadLink = `${process.env.FRONTEND_URL}/document/upload/${candidate.uuid}`;
                const subject = `Welcome ${candidate.name}! Please Upload Your Documents`;
                const message = `Hello ${candidate.name}, welcome to our recruitment process! Please upload your documents here: ${uploadLink}`;
    
                await sendNotification(candidate, agency, 'EMAIL', message, subject);
                
                await Log.create({
                    type: 'DOCUMENT_REMINDER',
                    candidate_id: candidate.id,
                    agency_id: candidate.agency_id,
                    status: 'SUCCESS',
                    message: `Reminder ${candidate.reminder_count + 1} sent to ${candidate.email}`
                });

                await candidate.increment('reminder_count');
            } else if (currentCount === 3) {
                console.log('⚠️ Candidate has reached maximum reminders:', candidate.name);
                await notifyAgency(candidate, agency);
                
                await Log.create({
                    type: 'AGENCY_ESCALATION',
                    candidate_id: candidate.id,
                    agency_id: candidate.agency_id,
                    status: 'SUCCESS',
                    message: `Final escalation sent about pending document upload for candidate ${candidate.name}`
                });

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

            const currentCount = parseInt(interview.reminder_count);
            if (currentCount < 3) {
                
                const confirmLink = `${process.env.FRONTEND_URL}/interview/confirm/${interview.uuid}`;
                const msg = `Reminder: Please confirm your interview with ${interview.company_name} on ${interview.interview_datetime}: ${confirmLink}`;
                
                await sendNotification(interview.Candidate, agency, 'EMAIL', msg, `Interview Confirmation Reminder: ${interview.company_name}`);
                
                await Log.create({
                    type: 'INTERVIEW_CONFIRMATION',
                    candidate_id: interview.Candidate.id,
                    agency_id: interview.Candidate.agency_id,
                    status: 'SUCCESS',
                    message: `Reminder ${interview.reminder_count + 1} sent to ${interview.Candidate.email}`
                });

                await interview.update({ reminder_count: currentCount + 1 });
            } 
            else if (currentCount === 3) {
                
                await notifyAgencyInterviewFailure(interview, agency);
                
                await Log.create({
                    type: 'AGENCY_ESCALATION',
                    candidate_id: interview.Candidate.id,
                    agency_id: interview.Candidate.agency_id,
                    status: 'SUCCESS',
                    message: `Final escalation sent about pending interview confirmation for candidate ${interview.Candidate.name}`
                });

                await interview.update({ confirmation_status: 'failed_confirmation' });
            }
        }
    } catch (error) {
        console.error('❌ Interview Scheduler Error:', error);
    }
};


module.exports = { processReminders, processInterviewReminders };
