const { Interview, Candidate, Agency } = require('../models');
const { sendNotification } = require('../services/notificationService');

exports.scheduleInterview = async (req, res) => {
    try {
        const { agency_id, candidate_id, company_name, interview_datetime } = req.body;

        // 1. डेटाबेस में इंटरव्यू रिकॉर्ड बनाएं
        const interview = await Interview.create({
            agency_id,
            candidate_id,
            company_name,
            interview_datetime,
            confirmation_status: 'pending', // डिफ़ॉल्ट स्टेटस
            reminder_count: 0
        });

        // 2. कैंडिडेट और एजेंसी की जानकारी निकालें (नोटिफिकेशन के लिए)
        const candidate = await Candidate.findByPk(candidate_id);
        const agency = await Agency.findByPk(agency_id);

        // 3. Confirmation Link जेनरेट करें
        const confirmLink = `${process.env.FRONTEND_URL}/confirm/${interview.id}`;
        const message = `Hi ${candidate.name}, your interview with ${company_name} is scheduled for ${interview_datetime}. Please confirm here: ${confirmLink}`;

        // 4. WhatsApp + Email भेजें
        await sendNotification(candidate, agency, 'BOTH', message);

        res.status(201).json({
            success: true,
            message: "Interview scheduled and candidate notified",
            interview
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- D. Interview Confirmation API ---
exports.confirmInterview = async (req, res) => {
    try {
        const { interview_id } = req.params;

        const interview = await Interview.findByPk(interview_id);
        if (!interview) return res.status(404).json({ message: "Interview not found" });

        // स्टेटस अपडेट करें
        await interview.update({ confirmation_status: 'confirmed' });

        // (Optional) रिक्रूटर को सूचित करें कि कैंडिडेट ने कन्फर्म कर दिया है
        
        res.status(200).json({ success: true, message: "Interview confirmed successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.rescheduleInterview = async (req, res) => {
    try {
        const { interview_id } = req.params;
        const { new_datetime } = req.body; // नया समय Frontend से आएगा

        // 1. पुराना इंटरव्यू रिकॉर्ड ढूंढें
        const interview = await Interview.findByPk(interview_id, {
            include: [Candidate, Agency]
        });

        if (!interview) return res.status(404).json({ message: "Interview record not found" });

        // 2. डेटा अपडेट करें
        // स्टेटस को वापस 'pending' कर दें क्योंकि नए समय के लिए फिर से कन्फर्मेशन चाहिए
        await interview.update({
            interview_datetime: new_datetime,
            confirmation_status: 'pending', 
            reminder_count: 0 // रिमाइंडर साइकिल रीसेट करें
        });

        // 3. नया कन्फर्मेशन लिंक भेजें
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