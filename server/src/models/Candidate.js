const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Agency = require('./Agency');

const Candidate = sequelize.define('Candidate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    agency_id: { 
        type: DataTypes.DECIMAL(11, 0), 
        allowNull: false,
        references: { model: 'agencies', key: 'id' }
    },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    reminder_count: { type: DataTypes.DECIMAL(11, 0), defaultValue: 0 }
}, {
    tableName: 'candidates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Candidate;
