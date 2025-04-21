const hre = require("hardhat");

async function main() {
  console.log("Deploying Wallet contract...");

  // Get the signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get the contract factory
  const Wallet = await hre.ethers.getContractFactory("Wallet");
  
  // Deploy the contract with the signer
  const wallet = await Wallet.connect(deployer).deploy();
  
  // Wait for deployment to finish
  await wallet.waitForDeployment();

  console.log("Wallet contract deployed to:", await wallet.getAddress());
}

// Handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 