const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying EphemeralBridge contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy the bridge contract
  const EphemeralBridge = await ethers.getContractFactory("EphemeralBridge");
  const bridge = await EphemeralBridge.deploy(deployer.address); // Use deployer as initial validator

  await bridge.deployed();

  console.log("EphemeralBridge deployed to:", bridge.address);
  console.log("Validator address:", deployer.address);

  // Save deployment info
  const deploymentInfo = {
    bridgeAddress: bridge.address,
    validatorAddress: deployer.address,
    network: "localhost",
    deployedAt: new Date().toISOString()
  };

  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\nUpdate your .env file with:");
  console.log(`VITE_BRIDGE_CONTRACT_ETH=${bridge.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });