const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const agencyController = require('../controllers/agencyController');

// POST Route with Validation
router.post(
    '/',
    [
        body('name')
            .trim()
            .notEmpty().withMessage('Agency name is required')
            .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters')
    ],
    agencyController.createAgency
);

router.get('/', agencyController.getAllAgencies);

module.exports = router;
