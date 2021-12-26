const sequelize = require('./index');
const { DataTypes, Model } = require('sequelize');
const { addModel } = require('../api/common/queryUtil');

class Clouds extends Model { }
Clouds.init({
    cloudId: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'clouds',
    tableName: 'clouds',
    timestamps: true,
    updatedAt: 'updatedOn',
    createdAt: 'createdOn'
});
addModel(Clouds, 'cloud');
module.exports = Clouds;