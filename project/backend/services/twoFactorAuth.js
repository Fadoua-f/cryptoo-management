const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class TwoFactorAuthService {
    static async generateSecret(userId) {
        const secret = speakeasy.generateSecret({
            name: `CryptoWallet-${userId}`
        });

        const id = uuidv4();
        await pool.execute(
            'INSERT INTO two_factor_auth (id, user_id, secret_key) VALUES (?, ?, ?)',
            [id, userId, secret.base32]
        );

        const qrCode = await qrcode.toDataURL(secret.otpauth_url);
        return {
            secret: secret.base32,
            qrCode
        };
    }

    static async verifyToken(userId, token) {
        const [rows] = await pool.execute(
            'SELECT secret_key FROM two_factor_auth WHERE user_id = ? AND is_enabled = TRUE',
            [userId]
        );

        if (rows.length === 0) {
            throw new Error('2FA not enabled for this user');
        }

        const verified = speakeasy.totp.verify({
            secret: rows[0].secret_key,
            encoding: 'base32',
            token: token
        });

        return verified;
    }

    static async enable2FA(userId, token) {
        const verified = await this.verifyToken(userId, token);
        if (!verified) {
            throw new Error('Invalid 2FA token');
        }

        await pool.execute(
            'UPDATE two_factor_auth SET is_enabled = TRUE WHERE user_id = ?',
            [userId]
        );

        // Generate backup codes
        const backupCodes = Array.from({ length: 10 }, () => 
            speakeasy.generateSecret({ length: 20 }).base32
        );

        await pool.execute(
            'UPDATE two_factor_auth SET backup_codes = ? WHERE user_id = ?',
            [JSON.stringify(backupCodes), userId]
        );

        return backupCodes;
    }

    static async disable2FA(userId, token) {
        const verified = await this.verifyToken(userId, token);
        if (!verified) {
            throw new Error('Invalid 2FA token');
        }

        await pool.execute(
            'UPDATE two_factor_auth SET is_enabled = FALSE WHERE user_id = ?',
            [userId]
        );
    }

    static async verifyBackupCode(userId, backupCode) {
        const [rows] = await pool.execute(
            'SELECT backup_codes FROM two_factor_auth WHERE user_id = ?',
            [userId]
        );

        if (rows.length === 0) {
            throw new Error('No backup codes found');
        }

        const backupCodes = JSON.parse(rows[0].backup_codes);
        const index = backupCodes.indexOf(backupCode);

        if (index === -1) {
            return false;
        }

        // Remove used backup code
        backupCodes.splice(index, 1);
        await pool.execute(
            'UPDATE two_factor_auth SET backup_codes = ? WHERE user_id = ?',
            [JSON.stringify(backupCodes), userId]
        );

        return true;
    }
}

module.exports = TwoFactorAuthService; 