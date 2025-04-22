const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get all transactions for a wallet
router.get('/wallet/:walletId', async (req, res) => {
    console.log(`[GET /transactions/wallet/${req.params.walletId}] Fetching transactions for wallet`);
    try {
        const [transactions] = await pool.query(
            'SELECT * FROM transactions WHERE wallet_id = ? ORDER BY created_at DESC',
            [req.params.walletId]
        );
        console.log(`[GET /transactions/wallet/${req.params.walletId}] Found ${transactions.length} transactions`);
        res.json(transactions);
    } catch (error) {
        console.error(`[GET /transactions/wallet/${req.params.walletId}] Error fetching transactions:`, error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Create a new transaction
router.post('/', async (req, res) => {
    const { wallet_id, type, amount } = req.body;
    const transactionId = uuidv4();
    
    console.log(`[POST /transactions] Creating transaction:`, {
        wallet_id,
        type,
        amount,
        transactionId
    });
    
    try {
        // First check if wallet exists
        const [wallets] = await pool.query(
            'SELECT id FROM wallets WHERE id = ?',
            [wallet_id]
        );
        
        if (wallets.length === 0) {
            console.error(`[POST /transactions] Wallet ${wallet_id} not found`);
            return res.status(404).json({ error: 'Wallet not found' });
        }
        
        console.log(`[POST /transactions] Wallet ${wallet_id} found, proceeding with transaction creation`);
        
        // Map the transaction type to the database enum
        const dbType = type === 'deposit' ? 'RECEIVE' : 'SEND';
        
        // Start a transaction
        await pool.query('START TRANSACTION');

        // Insert the transaction with required fields
        const [result] = await pool.query(
            'INSERT INTO transactions (id, wallet_id, type, amount, from_address, to_address, tx_hash, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                transactionId, 
                wallet_id, 
                dbType, 
                amount,
                '0x0000000000000000000000000000000000000000', // Default from address
                '0x0000000000000000000000000000000000000000', // Default to address
                '0x' + transactionId.substring(0, 64), // Use transaction ID as tx_hash
                'COMPLETED' // Default status
            ]
        );

        // Commit the transaction
        await pool.query('COMMIT');
        
        console.log(`[POST /transactions] Transaction created successfully with ID: ${transactionId}`);

        // Fetch the created transaction
        const [transaction] = await pool.query(
            'SELECT * FROM transactions WHERE id = ?',
            [transactionId]
        );
        
        console.log(`[POST /transactions] Retrieved created transaction:`, transaction[0]);

        res.status(201).json(transaction[0]);
    } catch (error) {
        // Rollback in case of error
        await pool.query('ROLLBACK');
        console.error('[POST /transactions] Error creating transaction:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

module.exports = router; 