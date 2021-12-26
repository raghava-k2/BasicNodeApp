const sequelize = require('./index');
const { DataTypes, Model } = require('sequelize');
const Clouds = require('./clouds');
const { addModel } = require('../api/common/queryUtil');

class Usecases extends Model { }
Usecases.init({
    useCaseId: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    cloudId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    parentId: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    UIRoute: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'useCases',
    tableName: 'useCases',
    timestamps: true,
    updatedAt: 'updatedOn',
    createdAt: 'createdOn'
});

// Usecases.belongsTo(Clouds, { foreignKey: 'cloudId', as: 'cloud' });
// Usecases.belongsTo(Usecases, { foreignKey: 'parentId', as: 'useCase' });
addModel(Usecases, 'useCase');
module.exports = Usecases;