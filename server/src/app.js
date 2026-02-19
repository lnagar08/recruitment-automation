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

// 3. Routes
// app.use('/api/users', require('./routes/userRoutes'));


app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});

module.exports = app;
