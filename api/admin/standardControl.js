const express = require('express');
const router = express.Router();
const { prepareAndGetQuery } = require('../common/queryUtil');
const StandardControls = require('../../model/standardControls');
const readXlsxFile = require('read-excel-file/node');
const uploadFile = require('../middleware/fileUpload');
const { FILE_PATH } = require('../constant/apiConstant');
const path = require('path');
const Clients = require('../../model/clients');
const Clouds = require('../../model/clouds');
const fs = require('fs');

router.get('/', (req, res) => {
    const query = prepareAndGetQuery(req, ['client', 'cloud', 'standardControl']);
    StandardControls.findAndCountAll(query).then((data) => {
        res.status(200).send(data);
    }).catch((err) => {
        console.log('error fetching Cloud Standards tables: ', err);
        res.status(500).send(err);
    });
});

router.get('/:categoryName', (req, res) => {
    const { categoryName } = req.params;
    StandardControls.findAll({ where: { categoryName }, order: [['serialNo', 'ASC']] })
        .then((data) => {
            res.status(200).send(data);
        }).catch((err) => {
            console.log('error fetching Cloud Standards table : ', err);
            res.status(500).send(err);
        });
});

router.get('/:categoryName/:parentControlName', (req, res) => {
    const { categoryName, parentControlName } = req.params;
    StandardControls.findAll({
        where: { categoryName },
        include: [{
            model: StandardControls, as: 'standardControl',
            where: { name: parentControlName }
        }],
        order: [['serialNo', 'ASC']]
    })
        .then((data) => {
            res.status(200).send(data);
        }).catch((err) => {
            console.log('error fetching Cloud Standards table : ', err);
            res.status(500).send(err);
        });
});

router.post('/', (req, res) => {
    StandardControls.create(req.body).then(data => {
        res.status(200).send(data);
    }).catch(err => {
        console.log('error inserting into Cloud Standards table :', err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            res.status(400).send('There is already a record with this information.Client, Cloud, Category and Name should be unique');
        } else {
            res.status(500).send(err);
        }
    });
});

router.post('/bulkUpload', uploadFile(FILE_PATH.STANDARD_CONTROL_LOCATION).single('file'),
    async (req, res) => {
        const map = {
            'Client Name': 'clientId',
            'Cloud Provider': 'cloudId',
            'Category Name': 'categoryName',
            'Key': 'name',
            'Value': 'value',
            'Serial Number': 'serialNo',
            'Remarks': 'remarks',
            'Parent Control Name': 'parentId'
        };
        const pathUrl = path.join(__dirname, '..', `${FILE_PATH.STANDARD_CONTROL_LOCATION}`);
        try {
            const { rows } = await readXlsxFile(`${pathUrl}${req.file.filename}`, { map });
            const clients = await Clients.findAll();
            const standardControls = await StandardControls.findAll();
            const clouds = await Clouds.findAll();
            const clientMap = new Map(clients.map(client => ([client.shortName, client.clientId])));
            const standardControltMap = new Map(standardControls.map(s => ([s.name, s.standardControlId])));
            const standardControlUniqueKey = new Set(standardControls.map(s =>
                (`${s.clientId}+${s.cloudId}+${s.categoryName}+${s.name}`)));
            const uniqueRows = new Set();
            const validate = (row, keys) => {
                return keys.reduce((acc, key) => {
                    if (!new String((row[key] || '')).trim().length) {
                        acc[key] = true;
                    }
                    return acc;
                }, {});
            }
            rows.forEach((row, index) => {
                const validation = validate(row, ['clientId', 'cloudId', 'categoryName', 'name']);
                if (Object.keys(validation).length) {
                    throw new TypeError(`Some mandatory field values are missing at row ${index + 2} 
                    like ${Object.keys(validation).join(',')}`);
                }
                const clientId = clientMap.get(row.clientId);
                if (!clientId) {
                    throw new TypeError(`Invalid Client Name : ${row.clientId} at row ${index + 2}`);
                }
                row.clientId = clientId;
                if ((row.parentId || '').trim().length) {
                    const standardControlId = standardControltMap.get(row.parentId);
                    if (!standardControlId) {
                        throw new TypeError(`Invalid Parent Control Name : ${row.parentId} at row ${index + 2}`);
                    }
                    row.parentId = standardControlId;
                }
                if (isNaN(row.serialNo)) {
                    row.serialNo = 0;
                }
                row.serialNo = parseInt(row.serialNo);
                const cloudId = clouds.find(c => c.code === row.cloudId);
                if (!cloudId) {
                    throw new TypeError(`Invalid Cloud Provider : ${row.cloudId} at row ${index + 2}`);
                }
                row.cloudId = cloudId.cloudId;
                const unqiueRow = `${row.clientId}+${row.cloudId}+${row.categoryName}+${row.name}`;
                if (uniqueRows.has(unqiueRow)) {
                    throw new TypeError(`Duplicate record in excel file at row ${index + 2}`);
                } else {
                    uniqueRows.add(unqiueRow);
                }
                if (standardControlUniqueKey.has(unqiueRow)) {
                    throw new TypeError(`Record already exists in Database .Please check the data at row ${index + 2}`);
                }
            });
            const bulkUploadData = await StandardControls.bulkCreate(rows);
            fs.unlink(`${pathUrl}${req.file.filename}`, () => { });
            res.status(200).send(bulkUploadData);
        } catch (e) {
            console.log('error uploading Cloud Standards', e);
            if (e instanceof TypeError) {
                res.status(400).send({ message: e.toString().split('TypeError:')[1] });
            } else {
                res.status(500).send('Failed to upload excel file');
            }
        }
    });

router.put('/:standardControlId', (req, res) => {
    const { standardControlId } = req.params;
    StandardControls.update(req.body, { where: { standardControlId } }).then(data => {
        res.status(200).send(data);
    }).catch(err => {
        console.log('error updating Cloud Standards table :', err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            res.status(400).send('There is already a record with this information.Client, Cloud, Category and Name should be unique');
        } else {
            res.status(500).send(err);
        }
    });
});

router.delete('/:standardControlId', (req, res) => {
    const { standardControlId } = req.params;
    StandardControls.destroy({ where: { standardControlId: parseInt(standardControlId) } })
        .then(() => {
            res.sendStatus(200);
        }).catch(err => {
            console.log('error deleting record from Cloud Standards table :', err);
            res.status(500).send(err);
        });
});

module.exports = router;
