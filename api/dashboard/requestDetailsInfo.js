const express = require('express');
const RequestDetails = require('../../model/requestDetails');
const router = express.Router();
const { prepareAndGetQuery } = require('../common/queryUtil');

router.get('/:reqId', (req, res) => {
    const { reqId } = req.params;
    const { filters = '{}' } = req.query;
    const filterObject = JSON.parse(filters);
    filterObject['request.requestId'] = { value: reqId, matchMode: 'equals' };
    req.query.filters = JSON.stringify(filterObject);
    const query = prepareAndGetQuery(req, ['request']);
    RequestDetails.findAndCountAll(query).then((data) => {
        res.status(200).send(data);
    }).catch((err) => {
        console.log('error fetching RequestDetail table : ', err);
        res.status(500).send(err);
    });
});

router.get('/resourceTypes/all', (req, res) => {
    RequestDetails.findAll({ attributes: ['resourceType'], group: 'resourceType' }).then((data) => {
        res.status(200).send(data);
    }).catch((err) => {
        console.log('error fetching RequestDetail Resouce Types  : ', err);
        res.status(500).send(err);
    });
});

module.exports = router;
