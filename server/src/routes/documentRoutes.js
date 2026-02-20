const express = require('express');
const router = express.Router();
const upload = require('../config/s3');
const documentController = require('../controllers/documentController');

router.post('/upload/:candidate_id', upload.single('file'), documentController.uploadDocument);

module.exports = router;
