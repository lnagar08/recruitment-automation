const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Document = sequelize.define('Document', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    candidate_id: { 
        type: DataTypes.DECIMAL(11, 0), 
        allowNull: false,
        references: { model: 'candidates', key: 'id' }
    },
    file_url: { type: DataTypes.STRING, allowNull: false }
}, {
    tableName: 'documents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Document;
