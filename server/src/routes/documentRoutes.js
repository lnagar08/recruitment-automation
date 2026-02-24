const express = require('express');
const router = express.Router();
//const upload = require('../config/s3');
const upload = require('../config/storage');
const documentController = require('../controllers/documentController');
const auth = require('../middlewares/authMiddleware');

router.post('/upload/:candidate_id', upload.single('file'), documentController.uploadDocument);

router.post('/reject/:candidate_id', auth, documentController.rejectDocument);
router.post('/approve/:candidate_id', auth, documentController.approveDocument);
router.post('/resend-link/:candidate_id', auth, documentController.resendDocumentUploadLink);

module.exports = router;
