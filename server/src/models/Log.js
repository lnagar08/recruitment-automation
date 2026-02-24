const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Log = sequelize.define('Log', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { 
        type: DataTypes.ENUM('INTERVIEW_SCHEDULE', 'INTERVIEW_RESCHEDULE', 'DOCUMENT_UPLOAD', 'DOCUMENT_REMINDER', 'INTERVIEW_CONFIRMATION', 'FINAL_ALERT', 'AGENCY_ESCALATION'),
        allowNull: false 
    },
    candidate_id: { type: DataTypes.INTEGER, allowNull: true },
    agency_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING(20) }, 
    message: { type: DataTypes.TEXT },      
    error: { type: DataTypes.TEXT }     
}, {
    tableName: 'logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Log;
