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
CREATE DATABASE IF NOT EXISTS crypto_management;
USE crypto_management;

# Create the necessary tables
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
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
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=crypto_management
JWT_SECRET=your_jwt_secret
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

2. The server will start on http://localhost:5000

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

## Troubleshooting

1. Database Connection Issues:
   - For Windows: Check Services (services.msc) to ensure MySQL is running
   - For macOS/Linux: Use `brew services list` or `sudo service mysql status`
   - Check your database credentials in .env
   - Ensure the database exists
   - If using XAMPP, ensure MySQL service is started from XAMPP Control Panel

2. Server Issues:
   - Check if port 5000 is available
   - For Windows: Use `netstat -ano | findstr :5000` to check port usage
   - For macOS/Linux: Use `lsof -i :5000` to check port usage
   - Verify all dependencies are installed
   - Check for any error messages in the console

3. API Issues:
   - Ensure you're using the correct HTTP methods
   - Verify your authentication token is valid
   - Check the request payload format
   - For Windows: If using PowerShell, ensure you're using the correct line endings (CRLF) 