const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Agency = sequelize.define('Agency', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    smtp_config: {
        type: DataTypes.STRING,
        allowNull: true
    },
    whatsapp_config: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'agencies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Agency;
