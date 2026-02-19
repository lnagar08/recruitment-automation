const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Interview = sequelize.define('Interview', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    agency_id: { type: DataTypes.DECIMAL(11, 0), allowNull: false },
    candidate_id: { type: DataTypes.DECIMAL(11, 0), allowNull: false },
    company_name: { type: DataTypes.STRING },
    interview_datetime: { type: DataTypes.STRING },
    confirmation_status: { type: DataTypes.STRING},
    reminder_count: { type: DataTypes.DECIMAL(11, 0), defaultValue: 0 }
}, {
    tableName: 'interviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Interview;
