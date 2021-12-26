const sequelize = require('./index');
const dayjs = require('dayjs');
const { DataTypes, Model, Op } = require('sequelize');
const Clients = require('./clients');
const { addModel } = require('../api/common/queryUtil');
const Usecases = require('./usecases');
const UsersUseCases = require('./usersUseCase');
const { TIME_CONSTANT } = require('../api/constant/apiConstant');
class Users extends Model {
}
Users.init({
    userId: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'ROLE'
    },
    clientId: {
        type: DataTypes.BIGINT,
        allowNull: false,

    },
    isFirstTimeLoggedIn: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    passwordExpiry: {
        type: DataTypes.DATE,
        allowNull: false,
        get() {
            return dayjs(this.getDataValue('passwordExpiry')).format(TIME_CONSTANT.DATA_TIME_FORMAT);
        }
    },
    lastLoggedIn: {
        type: DataTypes.DATE,
        allowNull: true,
        get() {
            return dayjs(this.getDataValue('lastLoggedIn')).format(TIME_CONSTANT.DATA_TIME_FORMAT);
        }
    },
}, {
    sequelize,
    modelName: 'users',
    tableName: 'users',
    timestamps: true,
    updatedAt: 'updatedOn',
    createdAt: 'createdOn'
});
Users.findByUserName = (username) => {
    return Users.findOne({ where: { name: { [Op.eq]: username } } });
}
// Users.belongsTo(Clients, { foreignKey: 'clientId', as: 'client' });
// Users.belongsToMany(Usecases, { through: UsersUseCases, foreignKey: 'userId', as: 'uuseCase' });
// Usecases.belongsToMany(Users, { through: UsersUseCases, foreignKey: 'useCaseId', as: 'uuser' });
addModel(Users, 'user');
module.exports = Users;