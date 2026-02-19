require('dotenv').config(); 
const app = require('./src/app');

const { sequelize } = require('./src/models'); 

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
       
        await sequelize.authenticate();
        console.log('✅ PostgreSQL Connected via Sequelize.');

        await sequelize.sync({ alter: true });
        console.log('📂 Database Tables Synced.');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Server failed to start:', error);
        process.exit(1);
    }
};

startServer();
