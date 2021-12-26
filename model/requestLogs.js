const sequelize = require('./index');
const { DataTypes, Model } = require('sequelize');
const Requests = require('./requests');
const { addModel } = require('../api/common/queryUtil');

class RequestLogs extends Model { }
RequestLogs.init({
    requestLogId: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    requestId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    terraFormInput: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    terraFormOutput: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    terraFormLog: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'requestLogs',
    tableName: 'requestLogs',
    timestamps: true,
    updatedAt: 'updatedOn',
    createdAt: 'createdOn'
});
// RequestLogs.belongsTo(Requests, { foreignKey: 'requestId', as: 'request' });
addModel(RequestLogs, 'requestLog');
module.exports = RequestLogs;