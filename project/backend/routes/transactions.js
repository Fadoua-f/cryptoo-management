const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all transactions for a wallet
router.get('/wallet/:walletId', async (req, res) => {
    try {
        const [transactions] = await pool.query(
            'SELECT * FROM transactions WHERE wallet_id = ? ORDER BY created_at DESC',
            [req.params.walletId]
        );
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Create a new transaction
router.post('/', async (req, res) => {
    const { wallet_id, type, amount } = req.body;
    try {
        // Start a transaction
        await pool.query('START TRANSACTION');

        // Insert the transaction
        const [result] = await pool.query(
            'INSERT INTO transactions (wallet_id, type, amount) VALUES (?, ?, ?)',
            [wallet_id, type, amount]
        );

        // Update wallet balance
        const balanceChange = type === 'deposit' ? amount : -amount;
        await pool.query(
            'UPDATE wallets SET balance = balance + ? WHERE id = ?',
            [balanceChange, wallet_id]
        );

        // Commit the transaction
        await pool.query('COMMIT');

        res.status(201).json({
            id: result.insertId,
            wallet_id,
            type,
            amount,
            created_at: new Date()
        });
    } catch (error) {
        // Rollback in case of error
        await pool.query('ROLLBACK');
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

module.exports = router; 