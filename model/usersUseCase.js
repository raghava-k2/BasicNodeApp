const sequelize = require('./index');
const { DataTypes, Model } = require('sequelize');

class UsersUseCases extends Model { }
UsersUseCases.init({
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    useCaseId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    selected: {
        type: DataTypes.TINYINT,
        allowNull: false,
        get() {
            return Boolean(this.getDataValue('selected'));
        },
        set(value) {
            this.setDataValue('selected', (value ? 1 : 0));
        }
    },
    partialSelected: {
        type: DataTypes.TINYINT,
        allowNull: false,
        get() {
            return Boolean(this.getDataValue('partialSelected'));
        },
        set(value) {
            this.setDataValue('partialSelected', (value ? 1 : 0));
        }
    }
}, {
    sequelize,
    modelName: 'usersUseCases',
    tableName: 'usersUseCases',
    timestamps: true,
    updatedAt: 'updatedOn',
    createdAt: 'createdOn'
});

module.exports = UsersUseCases;