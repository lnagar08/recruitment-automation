const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const agencyController = require('../controllers/agencyController');
const authController = require('../controllers/authController');

// POST Route with Validation
router.post(
    '/register',
    [
        body('name')
            .trim()
            .notEmpty().withMessage('Agency name is required')
            .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
        body('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Valid email is required')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('smtp_config').optional().isObject().withMessage('SMTP config must be an object'),
        body('whatsapp_config').optional().isObject().withMessage('WhatsApp config must be an object')
    ],
    agencyController.registerAgency
);

router.post('/login', 
    [
        body('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Valid email is required'),
        body('password')        
        .notEmpty().withMessage('Password is required')
    ], 
agencyController.login);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
