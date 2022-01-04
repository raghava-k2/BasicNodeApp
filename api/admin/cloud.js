const express = require('express');
const router = express.Router();
const Clouds = require('../../model/clouds');

router.get('/', (req, res) => {
    Clouds.findAll().then((data) => {
        res.status(200).send(data);
    }).catch((err) => {
        console.log('error fetching Usecases table : ', err);
        res.status(500).send(err);
    });
});

module.exports = router;