const { Interview, Candidate, Agency } = require('../models');
const { sendNotification } = require('../services/notificationService');

exports.scheduleInterview = async (req, res) => {
    try {
        const { candidate_id, company_name, interview_datetime } = req.body;
        const agency_id = req.agency_id;
        const interview = await Interview.create({
            agency_id,
            candidate_id,
            company_name,
            interview_datetime,
            confirmation_status: 'pending',
            reminder_count: 0
        });

        const candidate = await Candidate.findByPk(candidate_id);
        const agency = await Agency.findByPk(agency_id);

        const confirmLink = `${process.env.FRONTEND_URL}/confirm/${interview.uuid}`;
        const message = `Hi ${candidate.name}, your interview with ${company_name} is scheduled for ${interview_datetime}. Please confirm here: ${confirmLink}`;

        await sendNotification(candidate, agency, 'EMAIL', message);

        res.status(201).json({
            success: true,
            message: "Interview scheduled and candidate notified",
            interview
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.confirmInterview = async (req, res) => {
    try {
        const { interview_uuid } = req.params;

        const interview = await Interview.findOne({ 
            where: { uuid: interview_uuid },
            include: [Candidate, Agency] 
        });

        if (!interview) return res.status(404).json({ message: "Invalid Link" });

        await interview.update({ confirmation_status: 'confirmed' });

        await notifyRecruiterOnConfirmation(interview, interview.Candidate, interview.Agency, 'EMAIL');
        
        res.status(200).json({ success: true, message: "Interview confirmed successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.rescheduleInterview = async (req, res) => {
    try {
        const { interview_id } = req.params;
        const { new_datetime } = req.body;

        const interview = await Interview.findByPk(interview_id, {
            include: [Candidate, Agency]
        });

        if (!interview) return res.status(404).json({ message: "Interview record not found" });

        await interview.update({
            interview_datetime: new_datetime,
            confirmation_status: 'pending', 
            reminder_count: 0 
        });

        const confirmLink = `${process.env.FRONTEND_URL}/confirm/${interview.id}`;
        const message = `Hi ${interview.Candidate.name}, your interview with ${interview.company_name} has been RESCHEDULED to ${new_datetime}. Please confirm the new time here: ${confirmLink}`;

        await sendNotification(interview.Candidate, interview.Agency, 'BOTH', message);

        res.status(200).json({
            success: true,
            message: "Interview rescheduled and new confirmation link sent",
            data: interview
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
