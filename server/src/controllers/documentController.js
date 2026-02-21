const { Document, Candidate, Agency } = require('../models');
const { sendNotification } = require('../services/notificationService');

exports.uploadDocument = async (req, res) => {
    try {
        const candidate_id = req.params.candidate_id;
        
        const candidate = await Candidate.findOne({ where: { uuid: candidate_uuid } });
        if (!candidate) {
            return res.status(404).json({ message: "Invalid Link" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const newDoc = await Document.create({
            candidate_id: candidate.id,
            file_url: req.file.location 
        });

        await Candidate.update(
            { document_status: 'uploaded' },
            { where: { id: candidate_id } }
        );

        res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            data: newDoc
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.rejectDocument = async (req, res) => {
    try {
        const { candidate_id } = req.params;
        const { remark } = req.body; 

        const candidate = await Candidate.findByPk(candidate_id, { include: [Agency] });
        if (!candidate) return res.status(404).json({ message: "Candidate not found" });

        await candidate.update({
            document_status: 'pending',
            reminder_count: 0,
            rejection_remark: remark
        });

        const uploadLink = `${process.env.FRONTEND_URL}/upload/${candidate.uuid}`;
        const message = `⚠️ Your documents were rejected. Reason: ${remark}. Please re-upload here: ${uploadLink}`;
        
        await sendNotification(candidate, candidate.Agency, 'EMAIL', message);

        res.status(200).json({
            success: true,
            message: "Document rejected and candidate notified to re-upload."
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- Approve Logic (For Step B Completion) ---
exports.approveDocument = async (req, res) => {
    try {
        const { candidate_id } = req.params;
        await Candidate.update(
            { document_status: 'approved', rejection_remark: null },
            { where: { id: candidate_id } }
        );
        res.status(200).json({ success: true, message: "Document approved." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
