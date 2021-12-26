const express = require('express');
const { Op } = require("sequelize");
const router = express.Router();
const Clients = require('../../model/clients');
const { prepareAndGetQuery } = require('../common/queryUtil');

router.get('/', (req, res) => {
    const query = prepareAndGetQuery(req);
    Clients.findAndCountAll(query).then((data) => {
        res.status(200).send(data);
    }).catch((err) => {
        console.log('error fetching Clients table : ', err);
        res.status(500).send(err);
    });
});

router.post('/', (req, res) => {
    Clients.create(req.body).then(data => {
        res.status(200).send(data);
    }).catch(err => {
        console.log('error inserting into Clients table :', err);
        res.status(500).send(err);
    });
});

router.put('/:clientId', (req, res) => {
    const { clientId } = req.params;
    Clients.update(req.body, { where: { clientId } }).then(data => {
        res.status(200).send(data);
    }).catch(err => {
        console.log('error updating Clients table :', err);
        res.status(500).send(err);
    });
});

router.delete('/:clientId', (req, res) => {
    const { clientId } = req.params;
    Clients.destroy({ where: { clientId: parseInt(clientId) } }).then(() => {
        res.sendStatus(200);
    }).catch(err => {
        console.log('error deleting record from Clients table :', err);
        res.status(500).send(err);
    });
});

module.exports = router;