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
    const { wallet_id, type, amount, to_address, currency, tx_hash } = req.body;
    const transactionId = uuidv4();
    
    console.log(`[POST /transactions] Creating transaction:`, {
        wallet_id,
        type,
        amount,
        to_address,
        currency,
        tx_hash,
        transactionId,
        timestamp: new Date().toISOString()
    });
    
    try {
        // First check if wallet exists
        console.log(`[POST /transactions] Checking if wallet ${wallet_id} exists...`);
        const [wallets] = await pool.query(
            'SELECT id, address FROM wallets WHERE id = ?',
            [wallet_id]
        );
        
        if (wallets.length === 0) {
            console.error(`[POST /transactions] Wallet ${wallet_id} not found`);
            return res.status(404).json({ error: 'Wallet not found' });
        }
        
        const walletAddress = wallets[0].address;
        console.log(`[POST /transactions] Wallet ${wallet_id} found with address ${walletAddress}, proceeding with transaction creation`);
        
        // Map the transaction type to the database enum
        const dbType = type === 'deposit' ? 'RECEIVE' : 'SEND';
        console.log(`[POST /transactions] Mapped transaction type: ${type} -> ${dbType}`);
        
        // Start a transaction
        console.log(`[POST /transactions] Starting database transaction...`);
        await pool.query('START TRANSACTION');

        // Set default addresses if not provided
        const fromAddress = walletAddress;
        const toAddress = to_address || '0x0000000000000000000000000000000000000000';
        
        console.log(`[POST /transactions] Transaction addresses:`, {
            from: fromAddress,
            to: toAddress
        });

        // Use provided tx_hash or generate one
        const transactionHash = tx_hash || '0x' + transactionId.substring(0, 64);
        console.log(`[POST /transactions] Using transaction hash: ${transactionHash}`);

        // Insert the transaction with required fields
        console.log(`[POST /transactions] Inserting transaction into database...`);
        const [result] = await pool.query(
            'INSERT INTO transactions (id, wallet_id, type, amount, from_address, to_address, tx_hash, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                transactionId, 
                wallet_id, 
                dbType, 
                amount,
                fromAddress,
                toAddress,
                transactionHash,
                'COMPLETED' // Default status
            ]
        );

        // Commit the transaction
        console.log(`[POST /transactions] Committing database transaction...`);
        await pool.query('COMMIT');
        
        console.log(`[POST /transactions] Transaction created successfully with ID: ${transactionId}`);

        // Fetch the created transaction
        console.log(`[POST /transactions] Fetching created transaction details...`);
        const [transaction] = await pool.query(
            'SELECT * FROM transactions WHERE id = ?',
            [transactionId]
        );
        
        console.log(`[POST /transactions] Retrieved created transaction:`, {
            id: transaction[0].id,
            wallet_id: transaction[0].wallet_id,
            type: transaction[0].type,
            amount: transaction[0].amount,
            from_address: transaction[0].from_address,
            to_address: transaction[0].to_address,
            tx_hash: transaction[0].tx_hash,
            status: transaction[0].status,
            created_at: transaction[0].created_at
        });

        res.status(201).json(transaction[0]);
    } catch (error) {
        // Rollback in case of error
        console.error(`[POST /transactions] Error occurred, rolling back transaction...`);
        await pool.query('ROLLBACK');
        console.error('[POST /transactions] Error creating transaction:', error);
        console.error('[POST /transactions] Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

module.exports = router; 