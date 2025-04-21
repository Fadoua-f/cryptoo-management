const express = require('express');
const router = express.Router();
const { auth, require2FA } = require('../middleware/auth');
const TwoFactorAuthService = require('../services/twoFactorAuth');

// Generate 2FA secret
router.post('/setup', auth, async (req, res) => {
    try {
        const { userId } = req.user;
        const result = await TwoFactorAuthService.generateSecret(userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
router.post('/verify', auth, async (req, res) => {
    try {
        const { userId } = req.user;
        const { token } = req.body;
        const verified = await TwoFactorAuthService.verifyToken(userId, token);
        res.json({ verified });
    } catch (error) {
        res.status(400).json({ error: error.message });
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