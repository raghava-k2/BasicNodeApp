const express = require('express');
const fs = require('fs');
const router = express.Router();
const { FILE_PATH } = require('../constant/apiConstant');
const uploadFile = require('../middleware/fileUpload');
const path = require('path');

router.post('/upload', uploadFile(FILE_PATH.FILES_TEMP_LOCATION).single('file'), (req, res) => {
    const { user: { userId } } = req.session;
    const pathUrl = path.join(__dirname, '..', `${FILE_PATH.FILES_TEMP_LOCATION}`);
    const gcpFile = fs.readFileSync(`${pathUrl}${req.file.filename}`);
    const gcpFileName = req.file.originalname;
});