const { Agency } = require('../models');
const { validationResult } = require('express-validator');

// Create a New Agency
exports.createAgency = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { name, smtp_config, whatsapp_config } = req.body;

        const newAgency = await Agency.create({
            name,
            smtp_config: smtp_config || null,
            whatsapp_config: whatsapp_config || null
        });

        res.status(201).json({
            success: true,
            message: "Agency created successfully",
            data: newAgency
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get All Agencies
exports.getAllAgencies = async (req, res) => {
    try {
        const agencies = await Agency.findAll();
        res.status(200).json({ success: true, data: agencies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
