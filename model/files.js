const sequelize = require('./index');
const { DataTypes, Model } = require('sequelize');
const Requests = require('./requests');
const { addModel } = require('../api/common/queryUtil');
const Users = require('./users');

class Files extends Model { }
Files.init({
    fileId: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    savedName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    path: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    folderName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    parentFolderName: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'files',
    tableName: 'files',
    timestamps: true,
    updatedAt: 'updatedOn',
    createdAt: 'createdOn'
});

Files.belongsTo(Users, { foreignKey: 'userId', as: 'user' });

addModel(Files, 'file');

module.exports = Files;