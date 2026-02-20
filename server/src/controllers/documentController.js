const { Document, Candidate } = require('../models');

exports.uploadDocument = async (req, res) => {
    try {
        const candidate_id = req.params.candidate_id;
        
        const candidate = await Candidate.findByPk(candidate_id);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const newDoc = await Document.create({
            candidate_id: candidate_id,
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
