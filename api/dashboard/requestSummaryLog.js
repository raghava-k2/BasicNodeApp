const express = require('express');
const { getModel } = require('../common/queryUtil');
const router = express.Router();
const { Op } = require("sequelize");
const RequestLogs = require('../../model/requestLogs');

router.get('/:reqId', (req, res) => {
    const { reqId } = req.params;
    const includeModel = getModel('request');
    RequestLogs.findOne({
        where: { [`$request.requestId$`]: { [Op.eq]: reqId } },
        include: [includeModel]
    }).then((data) => {
        res.status(200).send(data);
    }).catch((err) => {
        console.log('error fetching RequestLogs table : ', err);
        res.status(500).send(err);
    });
});

module.exports = router;