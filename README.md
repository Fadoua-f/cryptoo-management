# Crypto Management System

A comprehensive cryptocurrency management system built with React, Node.js, and blockchain integration.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/download/win)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)
- [MySQL](https://dev.mysql.com/downloads/installer/) (v8.0 or higher)
  - For Windows: Download and install MySQL Installer
  - For macOS: Use `brew install mysql`
  - For Linux: Use your distribution's package manager

## Installation

1. Clone the repository:
```bash
# For Windows:
git clone https://github.com/Fadoua-f/cryptoo-management.git
cd cryptoo-management

# For macOS/Linux:
git clone https://github.com/Fadoua-f/cryptoo-management.git
cd cryptoo-management
```

2. Follow the [Backend Setup Guide](backend.md) to set up the database and backend server.

3. Install frontend dependencies:
```bash
# For Windows:
cd project
npm install

# For macOS/Linux:
cd project
npm install
```

4. Create a `.env` file in the `project` directory (frontend) with:
```env
VITE_API_URL=http://localhost:5000
```

## Running the Application

1. Start the backend server (follow instructions in [backend.md](backend.md))

2. In a new terminal, start the frontend development server:
```bash
# For Windows:
cd project
npm run dev

# For macOS/Linux:
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

## Documentation

- [Backend Setup Guide](backend.md) - Detailed instructions for setting up the backend
- [API Documentation](backend.md#api-endpoints) - Available API endpoints and usage

## Troubleshooting

If you encounter any issues:

1. Check the [Backend Setup Guide](backend.md#troubleshooting) for backend-specific issues
2. Make sure all dependencies are installed correctly
3. Verify that MySQL server is running
   - For Windows: Check Services (services.msc)
   - For macOS: Use `brew services list`
   - For Linux: Use `sudo service mysql status`
4. Check that all environment variables are set correctly
5. Ensure ports 5000 and 5173 are not in use by other applications
   - For Windows: Use `netstat -ano | findstr :5000`
   - For macOS/Linux: Use `lsof -i :5000`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 