const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Agency = require('./Agency');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    agency_id: {
        type: DataTypes.DECIMAL(11, 0),
        allowNull: false,
        references: {
            model: Agency,
            key: 'id'
        }
    },
    email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

Agency.hasMany(User, { foreignKey: 'agency_id' });
User.belongsTo(Agency, { foreignKey: 'agency_id' });

module.exports = User;
