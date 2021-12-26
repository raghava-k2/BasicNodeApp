const sequelize = require('./index');
const { DataTypes, Model } = require('sequelize');
const Clouds = require('./clouds');
const { addModel } = require('../api/common/queryUtil');
const Clients = require('./clients');

class StandardControls extends Model { }
StandardControls.init({
    standardControlId: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    clientId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    cloudId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    categoryName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.STRING,
        allowNull: true
    },
    remarks: {
        type: DataTypes.STRING,
        allowNull: true
    },
    parentId: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    serialNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'standardControls',
    tableName: 'standardControls',
    timestamps: true,
    updatedAt: 'updatedOn',
    createdAt: 'createdOn'
});

// StandardControls.belongsTo(Clients, { foreignKey: 'clientId', as: 'client' });
// StandardControls.belongsTo(Clouds, { foreignKey: 'cloudId', as: 'cloud' });
// StandardControls.belongsTo(StandardControls, { foreignKey: 'parentId', as: 'standardControl' });
addModel(StandardControls, 'standardControl');
module.exports = StandardControls;