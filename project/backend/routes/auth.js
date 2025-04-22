const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    try {
        console.log(`[Auth] Registration attempt for email: ${email}`);
        
        // Check if user already exists
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            console.log(`[Auth] Registration failed: Email already exists: ${email}`);
            return res.status(400).json({ error: 'Email already registered' });
        }

        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert new user with first_name and last_name
        const [result] = await pool.query(
            'INSERT INTO users (id, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
            [userId, email, hashedPassword, firstName, lastName]
        );

        console.log(`[Auth] User registered successfully: ${email}`);
        
        // Create user response object
        const user = {
            id: userId,
            email,
            firstName,
            lastName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true
        };

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            message: 'User created successfully',
            token,
            user
        });
    } catch (error) {
        console.error('[Auth] Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log(`[Auth] Login attempt for email: ${email}`);
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            console.log(`[Auth] Login failed: No user found with email ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            console.log(`[Auth] Login failed: Invalid password for user ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`[Auth] Login successful for user: ${user.first_name || user.email}`);

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user object along with token
        const userResponse = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            lastLogin: user.last_login,
            isActive: user.is_active
        };

        res.json({ 
            token, 
            user: userResponse,
            requires2FA: false // We'll implement 2FA later
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Logout
router.post('/logout', auth, async (req, res) => {
    try {
        await pool.execute(
            'DELETE FROM sessions WHERE token = ?',
            [req.token]
        );

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, email, first_name, last_name, created_at, last_login FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 