const sequelize = require('./index');
const { DataTypes, Model } = require('sequelize');
const Requests = require('./requests');
const { addModel } = require('../api/common/queryUtil');

class RequestDetails extends Model { }
RequestDetails.init({
    requestDetailId: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    requestId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    resourceType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resourceDescription: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resourceCount: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
}, {
    sequelize,
    modelName: 'requestDetails',
    tableName: 'requestDetails',
    timestamps: true,
    updatedAt: 'updatedOn',
    createdAt: 'createdOn'
});
// RequestDetails.belongsTo(Requests, { foreignKey: 'requestId', as: 'request' });
addModel(RequestDetails, 'requestDetail');
module.exports = RequestDetails;