const express = require('express');
const router = express.Router();
const { prepareAndGetQuery, getModel } = require('../common/queryUtil');
const Usecases = require('../../model/usecases');

router.get('/', (req, res) => {
    const query = prepareAndGetQuery(req, ['cloud', 'useCase']);
    Usecases.findAndCountAll(query).then((data) => {
        res.status(200).send(data);
    }).catch((err) => {
        console.log('error fetching Usecases table : ', err);
        res.status(500).send(err);
    });
});

router.get('/cloud/:cloudId', (req, res) => {
    const { cloudId } = req.params;
    const query = { where: { ['cloudId']: cloudId }, include: [getModel('useCase')] };
    Usecases.findAll(query).then((data) => {
        res.status(200).send(data);
    }).catch((err) => {
        console.log(`error fetching Usecases for provide cloud Id : ${cloudId} :`, err);
        res.status(500).send(err);
    });
});

router.post('/', (req, res) => {
    Usecases.create(req.body).then(data => {
        res.status(200).send(data);
    }).catch(err => {
        console.log('error inserting into Usecases table :', err);
        res.status(500).send(err);
    });
});

router.put('/:useCaseId', (req, res) => {
    const { useCaseId } = req.params;
    Usecases.update(req.body, { where: { useCaseId } }).then(data => {
        res.status(200).send(data);
    }).catch(err => {
        console.log('error updating Usecases table :', err);
        res.status(500).send(err);
    });
});

router.delete('/:useCaseId', (req, res) => {
    const { useCaseId } = req.params;
    Usecases.destroy({ where: { useCaseId: parseInt(useCaseId) } }).then(() => {
        res.sendStatus(200);
    }).catch(err => {
        console.log('error deleting record from Usecases table :', err);
        res.status(500).send(err);
    });
});

module.exports = router;
