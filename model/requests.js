const dayjs = require('dayjs');
const sequelize = require('./index');
const { DataTypes, Model } = require('sequelize');
const Clouds = require('./clouds');
const Users = require('./users');
const Usecases = require('./usecases');
const { TIME_CONSTANT } = require('../api/constant/apiConstant');

class Requests extends Model { }
Requests.init({
    requestId: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    }, cloudId: {
        type: DataTypes.BIGINT,
        allowNull: false
    }, userId: {
        type: DataTypes.BIGINT,
        allowNull: false
    }, useCaseId: {
        type: DataTypes.BIGINT,
        allowNull: false
    }, submittedOn: {
        type: DataTypes.DATE,
        allowNull: false,
        get() {
            return dayjs(this.getDataValue('submittedOn')).format(TIME_CONSTANT.DATA_TIME_FORMAT);
        },
        set(value) {
            if (value) {
                this.setDataValue('submittedOn', dayjs(value).tz('Asia/Kolkata').toDate());
            } else {
                this.setDataValue('submittedOn', value);
            }
        }
    }, completedOn: {
        type: DataTypes.DATE,
        allowNull: true,
        get() {
            if (this.getDataValue('completedOn')) {
                return dayjs(this.getDataValue('completedOn')).format(TIME_CONSTANT.DATA_TIME_FORMAT);
            }
            return null;
        },
        set(value) {
            if (value) {
                this.setDataValue('completedOn', dayjs(value).tz('Asia/Kolkata').toDate());
            } else {
                this.setDataValue('completedOn', value);
            }
        }
    }, status: {
        type: DataTypes.STRING,
        allowNull: false
    }, snowRef: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'requests',
    tableName: 'requests',
    timestamps: true,
    createdAt: false,
    updatedAt: false
});
// Requests.belongsTo(Clouds, { foreignKey: 'cloudId', as: 'cloud' });
// Requests.belongsTo(Users, { foreignKey: 'userId', as: 'user' });
// Requests.belongsTo(Usecases, { foreignKey: 'useCaseId', as: 'useCase' });
addModel(Requests, 'request');
module.exports = Requests;
