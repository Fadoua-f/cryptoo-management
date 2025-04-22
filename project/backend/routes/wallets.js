const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

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
        has_private_key: !!encrypted_private_key,
        timestamp: new Date().toISOString()
    });

    try {
        // First check if user exists
        console.log(`[POST /wallets] Checking if user ${user_id} exists...`);
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
        console.log(`[POST /wallets] Checking if wallet address ${address} already exists...`);
        const [existingWallets] = await pool.query(
            'SELECT id FROM wallets WHERE address = ?',
            [address]
        );

        if (existingWallets.length > 0) {
            console.error(`[POST /wallets] Wallet with address ${address} already exists`);
            return res.status(409).json({ error: 'Wallet address already exists' });
        }

        console.log(`[POST /wallets] No existing wallet found with address ${address}, proceeding with creation`);

        // Generate a UUID for the wallet
        const walletId = uuidv4();
        
        // Create the wallet
        console.log(`[POST /wallets] Inserting new wallet into database...`);
        await pool.query(
            'INSERT INTO wallets (id, user_id, currency, address, encrypted_private_key, name) VALUES (?, ?, ?, ?, ?, ?)',
            [walletId, user_id, currency, address, encrypted_private_key, `${currency} Wallet`]
        );
        console.log(`[POST /wallets] Wallet created successfully with ID: ${walletId}`);

        // Fetch the created wallet
        console.log(`[POST /wallets] Fetching created wallet details...`);
        const [wallet] = await pool.query(
            'SELECT * FROM wallets WHERE id = ?',
            [walletId]
        );
        
        if (!wallet || wallet.length === 0) {
            console.error(`[POST /wallets] Failed to retrieve created wallet with ID: ${walletId}`);
            return res.status(500).json({ error: 'Failed to retrieve created wallet' });
        }
        
        console.log(`[POST /wallets] Retrieved created wallet:`, {
            id: wallet[0].id,
            user_id: wallet[0].user_id,
            currency: wallet[0].currency,
            address: wallet[0].address,
            name: wallet[0].name,
            created_at: wallet[0].created_at,
            has_private_key: !!wallet[0].encrypted_private_key
        });

        res.status(201).json(wallet[0]);
    } catch (error) {
        console.error('[POST /wallets] Error creating wallet:', error);
        console.error('[POST /wallets] Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
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

// Delete a wallet
router.delete('/:id', async (req, res) => {
    const walletId = req.params.id;
    console.log(`[DELETE /wallets/${walletId}] Deleting wallet`);
    
    try {
        
        // Start a transaction
        console.log(`[DELETE /wallets/${walletId}] Starting database transaction...`);
        await pool.query('START TRANSACTION');

        // First check if wallet exists
        console.log(`[DELETE /wallets/${walletId}] Checking if wallet exists...`);
        const [wallets] = await pool.query(
            'SELECT id FROM wallets WHERE id = ?',
            [walletId]
        );
        
        if (wallets.length === 0) {
            console.error(`[DELETE /wallets/${walletId}] Wallet not found`);
            return res.status(404).json({ error: 'Wallet not found' });
        }

        // Delete associated transactions first (due to foreign key constraint)
        console.log(`[DELETE /wallets/${walletId}] Deleting associated transactions...`);
        await pool.query(
            'DELETE FROM transactions WHERE wallet_id = ?',
            [walletId]
        );

        // Delete the wallet
        console.log(`[DELETE /wallets/${walletId}] Deleting wallet...`);
        await pool.query(
            'DELETE FROM wallets WHERE id = ?',
            [walletId]
        );

        // Commit the transaction
        console.log(`[DELETE /wallets/${walletId}] Committing database transaction...`);
        await pool.query('COMMIT');
        
        console.log(`[DELETE /wallets/${walletId}] Wallet deleted successfully`);
        res.json({ message: 'Wallet deleted successfully' });
    } catch (error) {
        // Rollback in case of error
        console.error(`[DELETE /wallets/${walletId}] Error occurred, rolling back transaction...`);
        await pool.query('ROLLBACK');
        console.error(`[DELETE /wallets/${walletId}] Error deleting wallet:`, error);
        console.error(`[DELETE /wallets/${walletId}] Error details:`, {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Failed to delete wallet' });
    }
});

module.exports = router; 