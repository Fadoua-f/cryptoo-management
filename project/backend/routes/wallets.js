const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { pool } = require('../config/database');

// Get all wallets for a user
router.get('/:userId', async (req, res) => {
    try {
        const [wallets] = await pool.query(
            'SELECT * FROM wallets WHERE user_id = ?',
            [req.params.userId]
        );
        res.json(wallets);
    } catch (error) {
        console.error('Error fetching wallets:', error);
        res.status(500).json({ error: 'Failed to fetch wallets' });
    }
});

// Create a new wallet
router.post('/', async (req, res) => {
    const { user_id, currency, balance } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO wallets (user_id, currency, balance) VALUES (?, ?, ?)',
            [user_id, currency, balance]
        );
        res.status(201).json({ id: result.insertId, user_id, currency, balance });
    } catch (error) {
        console.error('Error creating wallet:', error);
        res.status(500).json({ error: 'Failed to create wallet' });
    }
});

// Update wallet balance
router.put('/:id', async (req, res) => {
    const { balance } = req.body;
    try {
        await pool.query(
            'UPDATE wallets SET balance = ? WHERE id = ?',
            [balance, req.params.id]
        );
        res.json({ message: 'Wallet updated successfully' });
    } catch (error) {
        console.error('Error updating wallet:', error);
        res.status(500).json({ error: 'Failed to update wallet' });
    }
});

module.exports = router; 