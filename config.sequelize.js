const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("api", "root", "qwerty", {
    dialect: "mysql",
    host: "localhost",
});

module.exports = sequelize;
