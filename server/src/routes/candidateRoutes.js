const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const candidateController = require('../controllers/candidateController');
const auth = require('../middlewares/authMiddleware');

const upload = multer({ dest: 'uploads/' }); 

const validateCandidate = [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('phone').isLength({ min: 10 }).withMessage('Valid phone is required'),
    body('email').isEmail().withMessage('Valid email is required')
];

// Routes
router.post('/', auth, validateCandidate, candidateController.createCandidate);
router.post('/bulk-upload', auth, upload.single('file'), candidateController.bulkUploadCandidates);

module.exports = router;
