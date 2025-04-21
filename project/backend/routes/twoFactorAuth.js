const express = require('express');
const router = express.Router();
const { auth, require2FA } = require('../middleware/auth');
const TwoFactorAuthService = require('../services/twoFactorAuth');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { pool } = require('../config/database');

// Generate 2FA secret for a user
router.post('/setup', async (req, res) => {
    const { userId } = req.body;
    try {
        const secret = speakeasy.generateSecret({
            name: 'CryptoApp'
        });

        // Store the secret in the database
        await pool.query(
            'UPDATE users SET two_factor_secret = ? WHERE id = ?',
            [secret.base32, userId]
        );

        // Generate QR code
        const qrCode = await QRCode.toDataURL(secret.otpauth_url);

        res.json({
            secret: secret.base32,
            qrCode
        });
    } catch (error) {
        console.error('Error setting up 2FA:', error);
        res.status(500).json({ error: 'Failed to setup 2FA' });
    }
});

// Enable 2FA
router.post('/enable', auth, async (req, res) => {
    try {
        const { userId } = req.user;
        const { token } = req.body;
        const backupCodes = await TwoFactorAuthService.enable2FA(userId, token);
        res.json({ message: '2FA enabled successfully', backupCodes });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Disable 2FA
router.post('/disable', auth, require2FA, async (req, res) => {
    try {
        const { userId } = req.user;
        const { token } = req.body;
        await TwoFactorAuthService.disable2FA(userId, token);
        res.json({ message: '2FA disabled successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Verify 2FA token
router.post('/verify', async (req, res) => {
    const { userId, token } = req.body;
    try {
        // Get user's 2FA secret
        const [users] = await pool.query(
            'SELECT two_factor_secret FROM users WHERE id = ?',
            [userId]
        );

        if (!users.length || !users[0].two_factor_secret) {
            return res.status(400).json({ error: '2FA not set up for this user' });
        }

        const verified = speakeasy.totp.verify({
            secret: users[0].two_factor_secret,
            encoding: 'base32',
            token
        });

        if (verified) {
            res.json({ verified: true });
        } else {
            res.status(400).json({ error: 'Invalid 2FA token' });
        }
    } catch (error) {
        console.error('Error verifying 2FA:', error);
        res.status(500).json({ error: 'Failed to verify 2FA' });
    }
});

// Verify backup code
router.post('/verify-backup', auth, async (req, res) => {
    try {
        const { userId } = req.user;
        const { backupCode } = req.body;
        const verified = await TwoFactorAuthService.verifyBackupCode(userId, backupCode);
        res.json({ verified });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 