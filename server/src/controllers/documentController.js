const { Document, Candidate, Agency } = require('../models');
const { sendNotification } = require('../services/notificationService');
const fs = require('fs');
const path = require('path');

exports.uploadDocument = async (req, res) => {
    try {
        const candidate_uuid = req.params.candidate_id;
        
        const candidate = await Candidate.findOne({ where: { uuid: candidate_uuid } });
        if (!candidate) {
            return res.status(404).json({ message: "Invalid Link" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        //const fileUrl = `${process.env.BASE_URL}/uploads/documents/${req.file.filename}`;
        const newDoc = await Document.create({
            candidate_id: candidate.id,
            //file_url: req.file.location 
            file_url: `/uploads/documents/${req.file.filename}`
        });

        await Candidate.update(
            { document_status: 'uploaded' },
            { where: { id: candidate.id } }
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

        const candidate = await Candidate.findByPk(candidate_id, {
            include: [
                { model: Document, as: 'documents' }, 
                { model: Agency }
            ]
        });

        if (!candidate) return res.status(404).json({ message: "Candidate not found" });

        const docs = candidate.documents || []; 

        if (docs.length > 0) {
            docs.forEach(doc => {
                const filename = doc.file_url.split('/').pop();
                const filePath = path.join(__dirname, '../../uploads/documents', filename);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });

            await Document.destroy({ where: { candidate_id: candidate.id } });
        }

        await candidate.update({
            document_status: 'pending',
            reminder_count: 0,
            rejection_remark: remark
        });

        const subject = `Document Rejection Notice for ${candidate.name}`;
        const message = `Hello ${candidate.name}, unfortunately your uploaded documents were rejected. Reason: ${remark}. will send again upload link shortly.`;
        
        await sendNotification(candidate, candidate.Agency, 'EMAIL', message, subject);

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

        const subject = `Document Approval!`;
        const message = `Hello ${candidate.name}, your uploaded documents have been approved. Thank you! we will schedule interview soon.`;
        
        const candidate = await Candidate.findByPk(candidate_id, { include: [Agency] });
        await sendNotification(candidate, candidate.Agency, 'EMAIL', message, subject);

        res.status(200).json({ success: true, message: "Document approved." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
