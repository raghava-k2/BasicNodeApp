const { Sequelize } = require('sequelize');
const config = require('config');
const db = config.get('dbConfig');
const userName = process.env.NODE_ENV !== 'default' ? process.env[db.username] : db.username;
const password = process.env.NODE_ENV !== 'default' ? process.env[db.password] : db.password;
const sequelize = new Sequelize(`${db.database}`, userName, password, {
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
