const express = require('express')
const router = express.Router();
const Requests = require('../../model/requests');
const { prepareAndGetQuery } = require('../common/queryUtil');

router.get('/', (req, res) => {
    const query = prepareAndGetQuery(req, ['cloud', 'useCase', 'user']);
    Requests.findAndCountAll(query).then((data) => {
        res.status(200).send(data);
    }).catch((err) => {
        console.log('error fetching Clients table : ', err);
        res.status(500).send(err);
    });
});

module.exports = router;
