# Backend Setup Guide

## Database Setup

1. First, ensure MySQL is running on your system:
   - For Windows: Open Services (services.msc) and ensure MySQL service is running
   - For macOS: `brew services start mysql`
   - For Linux: `sudo service mysql start`

2. Create the database and set up sample data:
```bash
# Connect to MySQL
# For Windows: 
# Option 1: Use MySQL Command Line Client from Start menu
# Option 2: Use MySQL Workbench (if installed)
# Option 3: If 'mysql' command is not available, you can:
#   a. Install MySQL Shell from the official MySQL website
#   b. Add MySQL bin directory to your PATH (typically C:\Program Files\MySQL\MySQL Server 8.0\bin)
#   c. Use the full path to mysql.exe: "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root

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
INSERT INTO users (username, email, password) VALUES 
('john_doe', 'john@example.com', '$2a$10$your_hashed_password'),
('jane_smith', 'jane@example.com', '$2a$10$your_hashed_password'),
('bob_wilson', 'bob@example.com', '$2a$10$your_hashed_password');

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
PORT=3001
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=crypto_demo
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
NODE_ENV=development
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

2. Install dependencies:
```bash
# For Windows:
cd project\backend
npm install

# For macOS/Linux:
cd project/backend
npm install
```

## Running the Backend

1. Start the development server:
```bash
# For Windows:
npm run dev

# For macOS/Linux:
npm run dev
```

2. The server will start on http://localhost:3001

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user

### Wallets
- GET `/api/wallets` - Get user's wallets
- POST `/api/wallets` - Create a new wallet
- GET `/api/wallets/:id` - Get wallet details
- PUT `/api/wallets/:id` - Update wallet

### Transactions
- GET `/api/transactions` - Get user's transactions
- POST `/api/transactions` - Create a new transaction
- GET `/api/transactions/:id` - Get transaction details

### Two-Factor Authentication
- POST `/api/2fa/setup` - Set up 2FA for a user
- POST `/api/2fa/verify` - Verify 2FA token
- POST `/api/2fa/enable` - Enable 2FA
- POST `/api/2fa/disable` - Disable 2FA

## Troubleshooting

1. Database Connection Issues:
   - For Windows: 
     - Check Services (services.msc) to ensure MySQL is running
     - If 'mysql' command is not available, use MySQL Workbench or MySQL Command Line Client from Start menu
     - If using XAMPP, ensure MySQL service is started from XAMPP Control Panel
   - For macOS/Linux: Use `brew services list` or `sudo service mysql status`
   - Check your database credentials in .env
   - Ensure the database exists
   - **IMPORTANT**: Make sure the database name in your .env file matches the database you created
   - If you get "Unknown column 'password' in 'field list'" error, ensure the users table has a password column
   - **IMPORTANT**: Use `127.0.0.1` instead of `localhost` in your DB_HOST to avoid IPv6 connection issues

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

4. Two-Factor Authentication Issues:
   - If you get "Unknown column 'two_factor_secret' in 'field list'" error:
     ```sql
     ALTER TABLE crypto_demo.users ADD COLUMN two_factor_secret VARCHAR(255);
     ```
   - If QR code is not loading:
     - Check if the user is properly logged in
     - Verify that the backend is running
     - Check the browser console for any errors
     - Ensure the user ID is being passed correctly in the request
   - If verification fails:
     - Make sure you're using a valid authenticator app
     - Check if the time on your device is synchronized
     - Try using the backup codes if available

## Common Issues and Solutions

1. **"Unknown column 'password' in 'field list'" error**:
   - This error occurs when the users table doesn't have a password column
   - Solution: Add the password column to the users table:
     ```sql
     ALTER TABLE crypto_demo.users ADD COLUMN password VARCHAR(255) AFTER email;
     ```

2. **"Unknown column 'two_factor_secret' in 'field list'" error**:
   - This error occurs when the users table doesn't have a two_factor_secret column
   - Solution: Add the two_factor_secret column to the users table:
     ```sql
     ALTER TABLE crypto_demo.users ADD COLUMN two_factor_secret VARCHAR(255);
     ```

3. **Database name mismatch**:
   - If you created a database named `crypto_management` but your .env file specifies `crypto_demo`, you'll get connection errors
   - Solution: Either rename your database or update your .env file to match the database name

4. **Port already in use**:
   - If you get an error that port 3001 is already in use, you can either:
     - Kill the process using that port
     - Change the port in your .env file to a different value (e.g., 3002)

5. **ECONNREFUSED error (IPv6 connection issue)**:
   - If you see an error like `Error: connect ECONNREFUSED ::1:3306`, this is an IPv6 connection issue
   - Solution: Change your DB_HOST in .env from `localhost` to `127.0.0.1` (IPv4 address)
   - This forces the connection to use IPv4 instead of IPv6
   - Alternatively, you can configure MySQL to accept IPv6 connections by editing your MySQL configuration file 

## Resetting Database Tables

If you need to reset your database tables, here are several approaches:

### 1. Drop and Recreate the Database

To completely reset everything and start fresh:

```sql
-- Connect to MySQL
mysql -u root

-- Drop the existing database (if it exists)
DROP DATABASE IF EXISTS crypto_demo;

-- Create a new database
CREATE DATABASE crypto_demo;

-- Use the database
USE crypto_demo;
```

### 2. Drop and Recreate Specific Tables

To reset specific tables while keeping others:

```sql
-- Connect to MySQL
mysql -u root

-- Use the database
USE crypto_demo;

-- Drop specific tables (in the correct order to respect foreign key constraints)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS two_factor_auth;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;
```

### 3. Truncate Tables (Keep Structure, Remove Data)

To keep the table structure but remove all data:

```sql
-- Connect to MySQL
mysql -u root

-- Use the database
USE crypto_demo;

-- Truncate tables (in the correct order to respect foreign key constraints)
TRUNCATE TABLE transactions;
TRUNCATE TABLE wallets;
TRUNCATE TABLE two_factor_auth;
TRUNCATE TABLE sessions;
TRUNCATE TABLE users;
```

### 4. Apply the Schema File

After dropping tables or the database, you can apply the schema.sql file to recreate the tables with the correct structure:

```bash
# For Windows:
cd project\backend
mysql -u root crypto_demo < database/schema.sql

# For macOS/Linux:
cd project/backend
mysql -u root crypto_demo < database/schema.sql
```

### 5. Add Missing Columns

If you're getting "Unknown column" errors, you can add the missing columns:

```sql
-- Connect to MySQL
mysql -u root

-- Use the database
USE crypto_demo;

-- Add missing columns to specific tables
ALTER TABLE wallets ADD COLUMN currency VARCHAR(10) NOT NULL DEFAULT 'ETH' AFTER user_id;
ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255);
```

### Important Notes:

1. Always be careful with the order of operations when resetting tables due to foreign key constraints. Tables with foreign keys should be dropped or truncated after the tables they reference.

2. If you're using the schema.sql file from the project, it uses UUIDs for IDs and has a more detailed table structure than the basic setup in this guide.

3. After resetting tables, you may need to restart your backend server for the changes to take effect.

4. If you're just trying to fix a specific column issue, it's better to add the missing column rather than resetting the entire database. 