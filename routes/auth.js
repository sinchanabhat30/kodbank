const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { uid, uname, password, email, phone, role } = req.body;

        // Basic validation
        if (!uname || !password || !email) {
            return res.status(400).json({ error: 'Username, password, and email are required.' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const initialBalance = 100000.00;
        const userRole = 'Customer'; // Fixed to customer as per requirements

        // We use either existing uid (if provided) or let DB auto-increment depending on schema setup
        // But the schema shows `uid INT AUTO_INCREMENT PRIMARY KEY`
        // We will insert uname, email, password, phone, role, balance
        const query = `
            INSERT INTO KodUser (username, email, password, phone, role, balance)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(query, [uname, email, hashedPassword, phone, userRole, initialBalance]);

        res.status(201).json({
            message: 'Registration successful. You can now login.',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Registration Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Username or email already exists.' });
        }
        res.status(500).json({ error: 'Internal server error during registration.' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { uname, password } = req.body;

        if (!uname || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        // Find user
        const [users] = await pool.execute('SELECT * FROM KodUser WHERE username = ?', [uname]);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const user = users[0];

        // Validate password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // Create JWT - username as subject, role as claim, no expiration
        const payload = {
            sub: user.username,
            role: user.role
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET);

        // Store token in UserToken table
        // First delete any old tokens for this user (optional clean up, but good practice)
        await pool.execute('DELETE FROM UserToken WHERE uid = ?', [user.uid]);

        // Insert new token
        await pool.execute('INSERT INTO UserToken (token, uid) VALUES (?, ?)', [token, user.uid]);

        // Set token in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // A long duration since no explicit token expiry is asked
        });

        res.status(200).json({
            message: 'Login successful',
            user: { username: user.username, role: user.role }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error during login.' });
    }
});

// Balance Route (Protected)
router.get('/balance', authMiddleware, async (req, res) => {
    try {
        const username = req.user.sub;

        // Fetch balance from KodUser
        const [users] = await pool.execute('SELECT balance FROM KodUser WHERE username = ?', [username]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ balance: users[0].balance });

    } catch (error) {
        console.error('Balance Error:', error);
        res.status(500).json({ error: 'Internal server error while fetching balance.' });
    }
});

module.exports = router;
