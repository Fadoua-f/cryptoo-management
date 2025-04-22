#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Hardhat local node...${NC}"
echo -e "${YELLOW}This will start a local Ethereum network for development.${NC}"
echo -e "${YELLOW}Keep this terminal window open while using the application.${NC}"
echo ""

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo -e "${RED}Error: npx is not installed. Please install Node.js and npm.${NC}"
    exit 1
fi

# Check if hardhat is installed
if ! npx hardhat --version &> /dev/null; then
    echo -e "${YELLOW}Hardhat not found. Installing...${NC}"
    npm install --save-dev hardhat
fi

# Start Hardhat node
echo -e "${GREEN}Starting Hardhat node...${NC}"
eceho -e "${YELLOW}Press Ctrl+C to stop the node when you're done.${NC}"
echo ""

npx hardhat node

# If the node stops, show a message
echo -e "${RED}Hardhat node stopped.${NC}"
echo -e "${YELLOW}The application will not be able to create wallets until you restart the node.${NC}" 