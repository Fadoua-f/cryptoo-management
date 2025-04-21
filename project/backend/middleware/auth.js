const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const TwoFactorAuthService = require('../services/twoFactorAuth');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error('Authentication required');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if session is valid
        const [sessions] = await pool.execute(
            'SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()',
            [token]
        );

        if (sessions.length === 0) {
            throw new Error('Session expired');
        }

        // Check if user exists and is active
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE id = ? AND is_active = TRUE',
            [decoded.userId]
        );

        if (users.length === 0) {
            throw new Error('User not found or inactive');
        }

        req.user = users[0];
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

const require2FA = async (req, res, next) => {
    try {
        const twoFactorToken = req.header('X-2FA-Token');
        
        if (!twoFactorToken) {
            return res.status(403).json({ error: '2FA token required' });
        }

        const verified = await TwoFactorAuthService.verifyToken(req.user.id, twoFactorToken);
        
        if (!verified) {
            return res.status(403).json({ error: 'Invalid 2FA token' });
        }

        next();
    } catch (error) {
        res.status(403).json({ error: error.message });
    }
};

module.exports = {
    auth,
    require2FA
}; 