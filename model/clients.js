const sequelize = require('./index');
const { DataTypes, Model } = require('sequelize');
const { addModel } = require('../api/common/queryUtil');

class Clients extends Model { }
Clients.init({
    clientId: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    shortName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    contact: {
        type: DataTypes.STRING,
        allowNull: true,
        validate:{
            is:/^(\+?\d{1,4}[\s-])?(?!0+\s+,?$)(?=.*\d{4,10}$)/
        }
    }
}, {
    sequelize,
    modelName: 'clients',
    tableName: 'clients',
    timestamps: true,
    updatedAt: 'updatedOn',
    createdAt: 'createdOn'
});
addModel(Clients, 'client');
module.exports = Clients;