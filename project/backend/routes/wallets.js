const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { pool } = require('../config/database');

// Get all wallets for a user
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    console.log(`[GET /wallets/${userId}] Fetching wallets for user`);
    try {
        const [wallets] = await pool.query(
            'SELECT * FROM wallets WHERE user_id = ?',
            [userId]
        );
        console.log(`[GET /wallets/${userId}] Found ${wallets.length} wallets:`, wallets);
        res.json(wallets);
    } catch (error) {
        console.error(`[GET /wallets/${userId}] Error fetching wallets:`, error);
        res.status(500).json({ error: 'Failed to fetch wallets' });
    }
});

// Create a new wallet
router.post('/', async (req, res) => {
    const { user_id, currency, address, encrypted_private_key } = req.body;
    console.log('[POST /wallets] Creating new wallet with data:', {
        user_id,
        currency,
        address,
        encrypted_private_key: '***' // Hide private key in logs
    });

    try {
        // First check if user exists
        const [users] = await pool.query(
            'SELECT id FROM users WHERE id = ?',
            [user_id]
        );
        
        if (users.length === 0) {
            console.error(`[POST /wallets] User ${user_id} not found`);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`[POST /wallets] User ${user_id} found, proceeding with wallet creation`);

        // Check if wallet address already exists
        const [existingWallets] = await pool.query(
            'SELECT id FROM wallets WHERE address = ?',
            [address]
        );

        if (existingWallets.length > 0) {
            console.error(`[POST /wallets] Wallet with address ${address} already exists`);
            return res.status(409).json({ error: 'Wallet address already exists' });
        }

        // Create the wallet
        const [result] = await pool.query(
            'INSERT INTO wallets (id, user_id, currency, address, encrypted_private_key, name) VALUES (UUID(), ?, ?, ?, ?, ?)',
            [user_id, currency, address, encrypted_private_key, `${currency} Wallet`]
        );
        console.log(`[POST /wallets] Wallet created successfully`);

        // Fetch the created wallet
        const [wallet] = await pool.query(
            'SELECT * FROM wallets WHERE id = ?',
            [result.insertId]
        );
        console.log(`[POST /wallets] Retrieved created wallet:`, {
            ...wallet[0],
            encrypted_private_key: '***' // Hide private key in logs
        });

        res.status(201).json(wallet[0]);
    } catch (error) {
        console.error('[POST /wallets] Error creating wallet:', error);
        res.status(500).json({ error: 'Failed to create wallet' });
    }
});

// Update wallet balance
router.put('/:id', async (req, res) => {
    const { balance } = req.body;
    const walletId = req.params.id;
    console.log(`[PUT /wallets/${walletId}] Updating wallet balance to ${balance}`);
    try {
        await pool.query(
            'UPDATE wallets SET balance = ? WHERE id = ?',
            [balance, walletId]
        );
        console.log(`[PUT /wallets/${walletId}] Wallet balance updated successfully`);
        res.json({ message: 'Wallet updated successfully' });
    } catch (error) {
        console.error(`[PUT /wallets/${walletId}] Error updating wallet:`, error);
        res.status(500).json({ error: 'Failed to update wallet' });
    }
});

module.exports = router; 