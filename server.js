// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
require('dotenv').config();

// Set up Express
const app = express();
app.use(bodyParser.json());

// Load database configuration from environment variables
const dbConfig = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECTION_STRING
};

// Database connection helper function
async function initializeDatabase() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('OracleDB pool created');
    } catch (err) {
        console.error('Error creating OracleDB pool', err);
    }
}

// Endpoint: Signup
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const connection = await oracledb.getConnection();
        await connection.execute(
            `INSERT INTO users (name, email, password) VALUES (:name, :email, :password)`,
            { name, email, password },
            { autoCommit: true }
        );
        res.json({ message: 'Signup successful' });
        await connection.close();
    } catch (err) {
        console.error('Signup failed', err);
        res.status(500).json({ message: 'Signup failed' });
    }
});

// Endpoint: Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const connection = await oracledb.getConnection();
        const result = await connection.execute(
            `SELECT * FROM users WHERE email = :email AND password = :password`,
            { email, password }
        );

        if (result.rows.length > 0) {
            res.json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
        await connection.close();
    } catch (err) {
        console.error('Login failed', err);
        res.status(500).json({ message: 'Login failed' });
    }
});

// Initialize the OracleDB pool and start the server
initializeDatabase()
    .then(() => {
        app.listen(3000, () => {
            console.log('Server running on port 3000');
        });
    })
    .catch(err => {
        console.error('Error initializing database', err);
        process.exit(1);
    });
