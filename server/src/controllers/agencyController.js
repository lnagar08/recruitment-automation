const { Agency, User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { generateTokens } = require('../utils/tokenHelper');
const { validationResult } = require('express-validator');

exports.registerAgency = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const t = await sequelize.transaction();

    try {
        const { name, email, password, smtp_config, whatsapp_config } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const agency = await Agency.create({
            name,
            smtp_config: smtp_config || null,
            whatsapp_config: whatsapp_config || null,
        }, { transaction: t });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            agency_id: agency.id,
            email,
            password: hashedPassword
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            success: true,
            message: "Agency registered successfully",
            agency_id: agency.id
        });

    } catch (error) {
        
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const payload = { agency_id: user.agency_id, user_id: user.id };
        const tokens = generateTokens(payload);

        res.json({
            success: true,
            ...tokens,
            agency_id: user.agency_id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
