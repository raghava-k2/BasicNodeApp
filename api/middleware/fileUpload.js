const path = require('path');
const fs = require('fs');
const multer = require("multer");

const storage = (fileLocation) => {
    return multer.diskStorage({
        destination: (_, __, cb) => {
            const pathUrl = path.join(__dirname, '..', `${fileLocation}`);
            fs.mkdirSync(pathUrl, { recursive: true });
            cb(null, pathUrl);
        },
        filename: (_, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        },
    });
}

const uploadFile = (fileLocation) => multer({ storage: storage(fileLocation) });

module.exports = uploadFile;