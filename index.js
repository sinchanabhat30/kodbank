const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const pool = require('./db');

const app = express();

app.use(express.json());
app.use(cookieParser());

// Allow frontend connection
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Update this based on where your frontend runs
    credentials: true,
}));

// Setup routes
app.use('/api', authRoutes);

const PORT = process.env.PORT || 5000;

pool.getConnection()
    .then(connection => {
        console.log('Connected to MySQL via Aiven');
        connection.release();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error('Error connecting to MySQL:', error);
    });
