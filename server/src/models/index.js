const { sequelize } = require('../config/db');

const Agency = require('./Agency');
const User = require('./User');
const Candidate = require('./Candidate');
const Document = require('./Document');
const Interview = require('./Interview');

// --- Relationships (Associations) ---

// 1. Agency Relationships
Agency.hasMany(User, { foreignKey: 'agency_id', as: 'users' });
User.belongsTo(Agency, { foreignKey: 'agency_id' });

Agency.hasMany(Candidate, { foreignKey: 'agency_id', as: 'candidates' });
Candidate.belongsTo(Agency, { foreignKey: 'agency_id' });

Agency.hasMany(Interview, { foreignKey: 'agency_id', as: 'interviews' });
Interview.belongsTo(Agency, { foreignKey: 'agency_id' });

// 2. Candidate Relationships
Candidate.hasMany(Document, { foreignKey: 'candidate_id', as: 'documents' });
Document.belongsTo(Candidate, { foreignKey: 'candidate_id' });

Candidate.hasMany(Interview, { foreignKey: 'candidate_id', as: 'interviews' });
Interview.belongsTo(Candidate, { foreignKey: 'candidate_id' });

// --- Export ---
module.exports = {
    sequelize,
    Agency,
    User,
    Candidate,
    Document,
    Interview
};
