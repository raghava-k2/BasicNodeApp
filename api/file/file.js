const express = require('express');
const fs = require('fs');
const router = express.Router();
const { FILE_PATH, FILE_UPLOAD } = require('../constant/apiConstant');
const uploadFile = require('../middleware/fileUpload');
const path = require('path');
const { default: axios } = require('axios');
const Files = require('../../model/files');
const config = require('config');
const secretKeys = config.get('secretKeys');

const token = (process.env.NODE_ENV || 'default') !== 'default' ? process.env[secretKeys.gitLab] : secretKeys.gitLab;

const projectId = 33143849;

const api_url = `https://gitlab.com/api/v4/projects/${projectId}/repository/files`;

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
            'PRIVATE-TOKEN': `${token}`
        },
    }
    try {
        const { path } = await Files.findOne({ where: { userId, fileId } });
        const { data } = await axios.get(`${path}?ref=main`, config);
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
    const data = {
        content: `${file}`,
        encoding: 'base64',
        branch: 'main',
        author_email: 'raghava.k2@gmail.com',
        author_name: 'Vijaya Raghava Kukapalli',
        commit_message: `Added a new file ${req.file.originalname}`,
        type: req.file.mimetype
    };
    const config = {
        method: 'post',
        url: `${api_url}/${encodeURIComponent(`${userId}/${req.file.filename}`)}`,
        headers: {
            'PRIVATE-TOKEN': `${token}`,
            'Content-Type': 'application/json'
        },
        data
    };
    let fileId = '';
    try {
        const { fileId: tempFileId } = await Files.create({
            userId, originalName: req.file.originalname, savedName: req.file.filename,
            path: ``,
            status: FILE_UPLOAD.INPROGRESS,
            type: req.file.mimetype
        });
        fileId = tempFileId;
        await axios(config);
        await Files.update({ status: FILE_UPLOAD.SUCCESS, path: `${api_url}/${encodeURIComponent(`${userId}/${req.file.filename}`)}` }, { where: { userId, fileId } });
        console.log('sucessfully uploaded : ');
        res.status(200).send({fileId});
    } catch (error) {
        await Files.destroy({ where: { userId, fileId } });
        console.log('error uploading to Github api: ', error);
        res.status(500).send(error.message);
    } finally {
        fs.unlink(`${pathUrl}${req.file.filename}`, () => { });
    }
});

router.delete('/:fileId', async (req, res) => {
    const { user: { userId } } = req.session;
    const { fileId } = req.params;
    try {
        const { path, savedName } = await Files.findOne({ where: { userId, fileId } });
        const data = {
            branch: 'main',
            author_email: 'raghava.k2@gmail.com',
            author_name: 'Vijaya Raghava Kukapalli',
            commit_message: `Deleted file ${savedName}`
        };
        const config = {
            method: 'delete',
            url: `${path}`,
            headers: {
                'PRIVATE-TOKEN': `${token}`,
                'Content-Type': 'application/json'
            },
            data
        };
        const { data: gitlabResponse } = await axios(config);
        await Files.destroy({ where: { userId, fileId } });
        res.status(200).send(gitlabResponse);
    } catch (error) {
        console.log('Error deleting data from Github api : ', error);
        res.status(500).send(error);
    }
})

module.exports = router;