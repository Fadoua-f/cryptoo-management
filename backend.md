# Backend Setup Guide

## Database Setup

1. First, ensure MySQL is running on your system:
   - For Windows: Open Services (services.msc) and ensure MySQL service is running
   - For macOS: `brew services start mysql`
   - For Linux: `sudo service mysql start`

2. Create the database and set up sample data:
```bash
# Connect to MySQL (if you haven't set a password yet)
# For Windows: Use MySQL Command Line Client or run:
mysql -u root -p
# For macOS/Linux:
mysql -u root

# Once connected, run these commands:
CREATE DATABASE IF NOT EXISTS crypto_demo;
USE crypto_demo;

# Create the necessary tables
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    two_factor_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    currency VARCHAR(10),
    balance DECIMAL(20,8),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT,
    type ENUM('deposit', 'withdrawal', 'trade'),
    amount DECIMAL(20,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id)
);

# Insert sample data
INSERT INTO users (username, email) VALUES 
('john_doe', 'john@example.com'),
('jane_smith', 'jane@example.com'),
('bob_wilson', 'bob@example.com');

INSERT INTO wallets (user_id, currency, balance) VALUES 
(1, 'BTC', 2.5),
(1, 'ETH', 15.0),
(2, 'BTC', 1.0),
(2, 'ETH', 25.0),
(3, 'BTC', 0.5),
(3, 'ETH', 10.0);

INSERT INTO transactions (wallet_id, type, amount) VALUES 
(1, 'deposit', 2.5),
(2, 'deposit', 15.0),
(3, 'deposit', 1.0),
(4, 'deposit', 25.0),
(5, 'deposit', 0.5),
(6, 'deposit', 10.0);
```

## Environment Configuration

1. Create a `.env` file in the `project\backend` directory (Windows) or `project/backend` (macOS/Linux) with these variables:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=crypto_demo

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3001
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

2. Install dependencies:
```bash
# For Windows:
cd project\backend
yarn install

# For macOS/Linux:
cd project/backend
yarn install
```

## Running the Backend

1. Start the development server:
```bash
# For Windows:
yarn dev

# For macOS/Linux:
yarn dev
```

2. The server will start on http://localhost:3001

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user
- GET `/api/auth/me` - Get current user info

### Wallets
- GET `/api/wallets/:userId` - Get all wallets for a user
- POST `/api/wallets` - Create a new wallet
- PUT `/api/wallets/:id` - Update wallet balance

### Transactions
- GET `/api/transactions/wallet/:walletId` - Get all transactions for a wallet
- POST `/api/transactions` - Create a new transaction

### Two-Factor Authentication
- POST `/api/2fa/setup` - Set up 2FA for a user
- POST `/api/2fa/enable` - Enable 2FA
- POST `/api/2fa/disable` - Disable 2FA
- POST `/api/2fa/verify` - Verify 2FA token
- POST `/api/2fa/verify-backup` - Verify backup code

## Troubleshooting

1. Database Connection Issues:
   - For Windows: Check Services (services.msc) to ensure MySQL is running
   - For macOS/Linux: Use `brew services list` or `sudo service mysql status`
   - Check your database credentials in .env
   - Ensure the database exists
   - If using XAMPP, ensure MySQL service is started from XAMPP Control Panel

2. Server Issues:
   - Check if port 3001 is available
   - For Windows: Use `netstat -ano | findstr :3001` to check port usage
   - For macOS/Linux: Use `lsof -i :3001` to check port usage
   - Verify all dependencies are installed
   - Check for any error messages in the console

3. API Issues:
   - Ensure you're using the correct HTTP methods
   - Verify your authentication token is valid
   - Check the request payload format
   - For Windows: If using PowerShell, ensure you're using the correct line endings (CRLF) 