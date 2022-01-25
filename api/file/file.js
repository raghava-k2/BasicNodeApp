const express = require('express');
const fs = require('fs');
const router = express.Router();
const { FILE_PATH, FILE_UPLOAD } = require('../constant/apiConstant');
const uploadFile = require('../middleware/fileUpload');
const path = require('path');
const { default: axios } = require('axios');
const Files = require('../../model/files');

const token = "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";

const github_api_url = `https://api.github.com/repos/raghava-k2/BasicVueApp/git/blobs`;

router.get('/', (req, res) => {
    const { user: { userId } } = req.session;
    const { filters = '{}' } = req.query;
    const filterObject = JSON.parse(filters);
    filterObject.userId = { value: userId, matchMode: 'equals' };
    filterObject.status = { value: FILE_UPLOAD.SUCCESS, matchMode: 'equals' };
    req.query.filters = JSON.stringify(filterObject);
    const query = prepareAndGetQuery(req);
    Files.findAndCountAll(query).then((data) => {
        res.status(200).send(data);
    }).catch((err) => {
        console.log('error fetching Files tables: ', err);
        res.status(500).send(err);
    });
});

router.get('/download/:fileId', async (req, res) => {
    const { user: { userId } } = req.session;
    const { fileId } = req.params;
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
        },
    }
    try {
        const { path } = await Files.findOne({ where: { userId, fileId } });
        const { data } = await axios.get(`${path}`, config);
        res.status(200).send(data);
    } catch (error) {
        console.log('Error getting data from Github api : ', error);
        res.status(500).send(error);
    }
});

router.post('/upload', uploadFile(FILE_PATH.FILES_TEMP_LOCATION).single('file'), async (req, res) => {
    const { user: { userId } } = req.session;
    const pathUrl = path.join(__dirname, '..', `${FILE_PATH.FILES_TEMP_LOCATION}`);
    const file = fs.readFileSync(`${pathUrl}${req.file.filename}`).toString('base64');
    const data = JSON.stringify({
        "content": `${file}`,
        "encoding": 'base64'
    });
    const config = {
        method: 'post',
        url: `${github_api_url}`,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
        },
        data
    };
    let fileId = '';
    try {
        const { fileId: tempFileId } = await Files.create({
            userId, originalName: req.file.originalname, savedName: req.file.filename,
            path: ``,
            status: FILE_UPLOAD.INPROGRESS
        });
        fileId = tempFileId;
        const { data } = await axios(config);
        await Files.update({ status: FILE_UPLOAD.SUCCESS, path: data.url }, { where: { userId, fileId } });
        console.log('sucessfully uploaded : ', data);
        res.sendStatus(200);
    } catch (error) {
        await Files.update({ status: FILE_UPLOAD.ERROR }, { where: { userId, fileId } });
        console.log('error uploading to Github api: ', error.message);
        res.status(500).send(error.message);
    } finally {
        fs.unlink(`${pathUrl}${req.file.filename}`, () => { });
    }
});

module.exports = router;