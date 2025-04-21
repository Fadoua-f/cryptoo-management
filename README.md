# Crypto Management System

A comprehensive cryptocurrency management system built with React, Node.js, and blockchain integration.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/download/win)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)
- [MySQL](https://dev.mysql.com/downloads/installer/) (v8.0 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Fadoua-f/cryptoo-management.git
cd cryptoo-management
```

2. Install backend dependencies:
```bash
cd project/backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../../
cd project
npm install
```

## Environment Setup

1. Create a `.env` file in the `project/backend` directory with the following variables:
```env
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=crypto_management
JWT_SECRET=your_jwt_secret
```

2. Create a `.env` file in the `project` directory (frontend) with:
```env
VITE_API_URL=http://localhost:5000
```

## Database Setup

1. Open MySQL command line client or MySQL Workbench
2. Create the database:
```sql
CREATE DATABASE crypto_management;
```
3. The schema will be automatically created when you start the backend server

## Running the Application

1. Start the backend server:
```bash
cd project/backend
npm run dev
```

2. In a new terminal, start the frontend development server:
```bash
cd project
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
project/
├── backend/           # Backend server code
│   ├── config/       # Configuration files
│   ├── routes/       # API routes
│   ├── middleware/   # Custom middleware
│   └── services/     # Business logic
├── src/              # Frontend source code
│   ├── components/   # React components
│   ├── context/      # React context
│   ├── pages/        # Page components
│   └── types/        # TypeScript types
└── public/           # Static assets
```

## Features

- User authentication and authorization
- Two-factor authentication
- Wallet management
- Transaction history
- Real-time cryptocurrency tracking
- Secure API endpoints

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed correctly
2. Verify that MySQL server is running
3. Check that all environment variables are set correctly
4. Ensure ports 5000 and 5173 are not in use by other applications

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 