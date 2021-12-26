const sequelize = require('./index');
const { DataTypes, Model } = require('sequelize');
const { addModel } = require('../api/common/queryUtil');
const Clouds = require('./clouds');
const Users = require('./users');
const { encrypt, decrypt } = require('../api/common/encryptAndDecrypt');
const config = require('config');

class CloudConnections extends Model { }
CloudConnections.init({
    cloudConnectionId: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    cloudId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    accountCode: {
        type: DataTypes.STRING,
        allowNull: true,

    },
    accessKey: {
        type: DataTypes.STRING,
        allowNull: true
    },
    secretKey: {
        type: DataTypes.STRING,
        allowNull: true,
        set(value) {
            const secreteKey = config.get('secretKeys.cloudConnections');
            const encryptedValue = encrypt(value, secreteKey);
            this.setDataValue('secretKey', encryptedValue);
        },
        get() {
            if (this.getDataValue('secretKey')) {
                const secreteKey = config.get('secretKeys.cloudConnections');
                const encryptedValue = this.getDataValue('secretKey');
                return decrypt(encryptedValue, secreteKey);
            }
            return null;
        }
    },
    clientId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    clientSecret: {
        type: DataTypes.STRING,
        allowNull: true,
        set(value) {
            const secreteKey = config.get('secretKeys.cloudConnections');
            const encryptedValue = encrypt(value, secreteKey);
            this.setDataValue('clientSecret', encryptedValue);
        },
        get() {
            if (this.getDataValue('clientSecret')) {
                const secreteKey = config.get('secretKeys.cloudConnections');
                const encryptedValue = this.getDataValue('clientSecret');
                return decrypt(encryptedValue, secreteKey);
            }
            return null;
        }
    },
    subscriptionId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tenantId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    gcpFileName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    gcpFile: {
        type: DataTypes.BLOB('long'),
        allowNull: true,
        get() {
            const gcpFile = this.getDataValue('gcpFile');
            return gcpFile ? gcpFile.toString('utf8') : '';
        }
    }
}, {
    sequelize,
    modelName: 'cloudConnections',
    tableName: 'cloudConnections',
    timestamps: true,
    updatedAt: 'updatedOn',
    createdAt: 'createdOn'
});
CloudConnections.belongsTo(Clouds, { foreignKey: 'cloudId', as: 'cloud' });
CloudConnections.belongsTo(Users, { foreignKey: 'userId', as: 'user' });
addModel(CloudConnections, 'cloudConnection');
module.exports = CloudConnections;