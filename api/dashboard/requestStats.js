const express = require('express');
const { QueryTypes } = require('sequelize');
const sequelize = require('../../model');
const router = express.Router();

const querys = {
    hyperScalar: `select c.cloudId,c.code,DATE_FORMAT(r.completedOn, :frequency) as date,
                  count(r.completedOn) as count from requests r 
                  join clouds c on c.cloudId = r.cloudId 
                  where date(r.completedOn) between :startDate and :endDate
                  and r.status = :status
                  #userQuery##cloudProviders#
                  group by c.cloudId,c.code,date
                  order by date`,
    hyperScalarAndResourceType: `select c.cloudId,c.code,rd.resourceType,
                  DATE_FORMAT(r.completedOn, :frequency) as date,
                  count(rd.resourceType) as count from requests r 
                  join clouds c on c.cloudId = r.cloudId 
                  join requestDetails rd  ON rd.requestId =r.requestId 
                  where date(r.completedOn) between :startDate and :endDate
                  and r.status = :status
                  #userQuery##cloudProviders##resourceTypes#
                  group by c.cloudId,c.code,rd.resourceType,date
                  order by date`,
    hyperScalarPerUser: `select u.name,DATE_FORMAT(r.completedOn, :frequency) as date,
                  count(r.completedOn) as count from requests r 
                  join users u on u.userId = r.userId 
                  where date(r.completedOn) between :startDate and :endDate
                  and r.status = :status
                  #userQuery#
                  group by u.name,date
                  order by date`,
    hyperScalarPerCloudProvider: `select c.code ,count(r.completedOn) as count from requests r
                  join clouds c on c.cloudId = r.cloudId 
                  where date(r.completedOn) between :startDate and :endDate
                  and r.status = :status
                  #userQuery##cloudProviders#
                  group by c.code
                  order by c.code`
};

router.get('/:queryName', (req, res) => {
    const { queryName } = req.params;
    const { startDate, endDate, userIds, cloudIds, frequency, resourceTypes } = req.query;
    let query = querys[queryName];
    query = query?.replace('#userQuery#', `${userIds ? ' and r.userId in (:userIds) ' : ''}`);
    query = query?.replace('#cloudProviders#', `${cloudIds ? ' and c.cloudId in (:cloudIds) ' : ''}`);
    query = query?.replace('#resourceTypes#', `${resourceTypes ? ' and rd.resourceType in (:resourceTypes) ' : ''}`);
    sequelize.query(query,
        {
            raw: false, type: QueryTypes.SELECT,
            replacements: {
                startDate, endDate, userIds, cloudIds,
                frequency: (frequency === 'd' ? '%y-%m-%d' : '%b-%y'),
                resourceTypes,
                status: 'COMPLETED'
            }
        }).then(data => {
            res.status(200).send(data);
        }).catch(error => {
            console.error(`Failed to fetch ${queryName} stats : `, error);
            res.status(500).send(error);
        });
});

module.exports = router;