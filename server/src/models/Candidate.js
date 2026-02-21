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
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false },
    document_status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
    reminder_count: { type: DataTypes.DECIMAL(11, 0), defaultValue: 0 },
    rejection_remark: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    }
}, {
    tableName: 'candidates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Candidate;
