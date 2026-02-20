const { Op } = require('sequelize');
const { Candidate, Agency } = require('../models');
const { validationResult } = require('express-validator');
const { sendNotification } = require('../services/notificationService');
const xlsx = require('xlsx');
const fs = require('fs');

// --- 1. Single Candidate Create ---
exports.createCandidate = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { agency_id, name, phone, email } = req.body;

        // 1. Check if Candidate already exists (Email or Phone)
        const existingCandidate = await Candidate.findOne({
            where: {
                [Op.or]: [{ email: email }, { phone: phone }]
            }
        });

        if (existingCandidate) {
            return res.status(400).json({ 
                success: false, 
                message: "Candidate with this email or phone already exists." 
            });
        }

        const agency = await Agency.findByPk(agency_id);
        if (!agency) return res.status(404).json({ message: "Agency not found" });

        const candidate = await Candidate.create({
            agency_id, name, phone, email
        });

        // --- Send Notification ---
        //if (agency.smtp_config || agency.whatsapp_config) {
            await sendNotification(candidate, agency, 'EMAIL');
        //}

        res.status(201).json({ 
            success: true, 
            message: "Candidate created and notified",
            data: candidate 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- 2. Excel Bulk Upload ---
exports.bulkUploadCandidates = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Please upload an excel file" });
        const { agency_id } = req.body;

        const agency = await Agency.findByPk(agency_id);
        if (!agency) return res.status(404).json({ message: "Agency not found" });

        // Excel Reading
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const candidatesData = data.map(item => ({
            agency_id,
            name: item.Name,
            phone: item.Phone?.toString(),
            email: item.Email
        }));

        const result = await Candidate.bulkCreate(candidatesData, {
            ignoreDuplicates: true,
            validate: true
        });
        
        if(result.length > 0){
            const notifyPromises = result.map(candidate => sendNotification(candidate, agency, 'EMAIL'));
            await Promise.all(notifyPromises);
        }
        // Delete the uploaded file after processing
        fs.unlinkSync(req.file.path);

        res.status(201).json({ success: true, message: `${result.length} Candidates imported` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.bulkUploadCandidates = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Please upload an excel file" });
        const { agency_id } = req.body;

        const agency = await Agency.findByPk(agency_id);
        if (!agency) return res.status(404).json({ message: "Agency not found" });
        
        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = xlsx.utils.sheet_to_json(sheet);

        if (excelData.length === 0) return res.status(400).json({ message: "Excel file is empty" });

        const emailsInExcel = excelData.map(item => item.Email).filter(Boolean);
        const phonesInExcel = excelData.map(item => item.Phone?.toString()).filter(Boolean);

        const existingCandidates = await Candidate.findAll({
            where: {
                [Op.or]: [
                    { email: { [Op.in]: emailsInExcel } },
                    { phone: { [Op.in]: phonesInExcel } }
                ]
            },
            attributes: ['email', 'phone']
        });

        const existingEmails = new Set(existingCandidates.map(c => c.email));
        const existingPhones = new Set(existingCandidates.map(c => c.phone));

        const finalData = [];
        const skippedCount = { email: 0, phone: 0 };

        excelData.forEach(item => {
            const email = item.Email;
            const phone = item.Phone?.toString();

            if (existingEmails.has(email) || existingPhones.has(phone)) {
                skippedCount.email++; 
            } else {
                finalData.push({
                    agency_id,
                    name: item.Name,
                    phone: phone,
                    email: email,
                    document_status: 'pending',
                    reminder_count: 0
                });
                
                existingEmails.add(email);
                existingPhones.add(phone);
            }
        });

        let result = [];
        if (finalData.length > 0) {
            result = await Candidate.bulkCreate(finalData);
        }

        if (result.length > 0) {
            const notifyPromises = result.map(candidate => sendNotification(candidate, agency, 'EMAIL'));
            await Promise.all(notifyPromises);
        }
        fs.unlinkSync(req.file.path);

        res.status(201).json({
            success: true,
            message: `${result.length} Candidates imported. ${skippedCount.email} duplicates skipped.`,
            total_imported: result.length,
            total_skipped: skippedCount.email
        });

    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message });
    }
};
