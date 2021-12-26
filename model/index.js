const { Sequelize } = require('sequelize');
const config = require('config');
const db = config.get('dbConfig')
const sequelize = new Sequelize(`${db.database}`, `${db.username}`, `${db.password}`, {
    host: `${db.host}`,
    dialect: `${db.dialect}`,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
module.exports = sequelize;
