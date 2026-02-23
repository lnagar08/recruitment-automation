const multer = require('multer');
const path = require('path');
const fs = require('fs');


const dir = './uploads/documents';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        
        cb(null, `doc_${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
