const Sequelize = require("sequelize");
const sequelize = require("../config.sequelize");

const post = sequelize.define('secposts', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    body: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    token: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});

module.exports = post;
