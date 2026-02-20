const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
};

app.use(helmet());
app.use(cors(corsOptions)); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 2. Sample Route (
app.get('/', (req, res) => {
    res.send('Welcome to the Recruitment Automation System API');
});

// API Routes
app.use('/api/agencies', require('./routes/agencyRoutes'));
app.use('/api/candidates', require('./routes/candidateRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));


app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

module.exports = app;
