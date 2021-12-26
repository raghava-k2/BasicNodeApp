const express = require('express');
const { Op } = require("sequelize");
const fs = require('fs');
const router = express.Router();
const CloudConnections = require('../../model/cloudConnections');
const { prepareAndGetQuery } = require('../common/queryUtil');
const { FILE_PATH } = require('../constant/apiConstant');
const uploadFile = require('../middleware/fileUpload');
const path = require('path');

router.get('/', (req, res) => {
    const query = prepareAndGetQuery(req, ['cloud']);
    CloudConnections.findAndCountAll(query).then((data) => {
        res.status(200).send(data);
    }).catch((err) => {
        console.log('error fetching Clients table : ', err);
        res.status(500).send(err);
    });
});

router.get('/:userId/:cloudId', (req, res) => {
    const { userId, cloudId } = req.params;
    CloudConnections.findOne({ where: { userId: `${userId}`, cloudId: `${cloudId}` } })
        .then((data) => {
            res.status(200).send(data);
        }).catch((err) => {
            console.log('error fetching CloudConenction table : ', err);
            res.status(500).send(err);
        });
});

router.post('/', (req, res) => {
    CloudConnections.findOne({
        where: {
            cloudId: `${req.body.cloudId}`,
            userId: `${req.body.userId}`
        }
    }).then(cloud => {
        if (cloud) {
            res.status(400).send({ message: 'Already there exists details for selected Cloud Provider' });
        } else {
            CloudConnections.create(req.body).then(data => {
                res.status(200).send(data);
            }).catch(err => {
                console.log('error inserting into CloudConnections table :', err);
                res.status(500).send(err);
            });
        }
    });
});

router.post('/gcp/upload', uploadFile(FILE_PATH.GCP_TEMP_LOCATION).single('file'), (req, res) => {
    const { cloudId, userId } = req.body;
    CloudConnections.findOne({
        where: {
            cloudId: cloudId,
            userId: userId
        }
    }).then(cloud => {
        if (cloud) {
            res.status(400).send({ message: 'Already there exists details for selected Cloud Provider' });
        } else {
            const pathUrl = path.join(__dirname, '..', `${FILE_PATH.GCP_TEMP_LOCATION}`);
            const gcpFile = fs.readFileSync(`${pathUrl}${req.file.filename}`);
            const gcpFileName = req.file.originalname;
            CloudConnections.create({ cloudId, userId, gcpFile, gcpFileName }).then(data => {
                fs.unlink(`${pathUrl}${req.file.filename}`, () => { });
                res.status(200).send(data);
            }).catch(err => {
                console.log('error inserting into CloudConnections table :', err);
                res.status(500).send(err);
            });
        }
    });
});

router.put('/:cloudConnectionId', (req, res) => {
    const { cloudConnectionId } = req.params;
    CloudConnections.findOne({
        where: {
            cloudId: `${req.body.cloudId}`,
            userId: `${req.body.userId}`,
            cloudConnectionId: { [Op.ne]: cloudConnectionId }
        }
    }).then(cloud => {
        if (cloud) {
            res.status(400).send({ message: 'Already there exists details for selected Cloud Provider' });
        } else {
            CloudConnections.update(req.body, { where: { cloudConnectionId } }).then(data => {
                res.status(200).send(data);
            }).catch(err => {
                console.log('error updating CloudConnections table :', err);
                res.status(500).send(err);
            });
        }
    })
});

router.put('/gcp/upload/:cloudConnectionId', uploadFile(FILE_PATH.GCP_TEMP_LOCATION).single('file'), (req, res) => {
    const { cloudConnectionId } = req.params;
    const { cloudId, userId } = req.body;
    CloudConnections.findOne({
        where: {
            cloudId: cloudId,
            userId: userId,
            cloudConnectionId: { [Op.ne]: cloudConnectionId }
        }
    }).then(cloud => {
        if (cloud) {
            res.status(400).send({ message: 'Already there exists details for selected Cloud Provider' });
        } else {
            const pathUrl = path.join(__dirname, '..', `${FILE_PATH.GCP_TEMP_LOCATION}`);
            const gcpFile = fs.readFileSync(`${pathUrl}${req.file.filename}`);
            const gcpFileName = req.file.originalname;
            CloudConnections.update({ cloudId, userId, gcpFile, gcpFileName },
                { where: { cloudConnectionId } }).then(data => {
                    fs.unlink(`${pathUrl}${req.file.filename}`, () => { });
                    res.status(200).send(data);
                }).catch(err => {
                    console.log('error updating into CloudConnections table :', err);
                    res.status(500).send(err);
                });
        }
    });
});

router.delete('/:cloudConnectionId', (req, res) => {
    const { cloudConnectionId } = req.params;
    CloudConnections.destroy({ where: { cloudConnectionId: parseInt(cloudConnectionId) } }).then(() => {
        res.sendStatus(200);
    }).catch(err => {
        console.log('error deleting record from CloudConnections table :', err);
        res.status(500).send(err);
    });
});

module.exports = router;