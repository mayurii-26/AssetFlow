import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying AssetRegistry contract...");

  // Get the contract factory
  const AssetRegistry = await ethers.getContractFactory("AssetRegistry");

  // Deploy the contract
  const assetRegistry = await AssetRegistry.deploy();

  // Wait for deployment to finish
  await assetRegistry.waitForDeployment();

  const address = await assetRegistry.getAddress();

  console.log("✅ AssetRegistry deployed to:", address);
  console.log("📝 Save this address to your .env file:");
  console.log(`   BLOCKCHAIN_CONTRACT_ADDRESS=${address}`);

  // Optionally verify deployment by calling a view function
  const testAssetId = "DEMO_ASSET_001";
  const eventCount = await assetRegistry.getEventCount(testAssetId);
  console.log(`\n🔍 Test query: Event count for ${testAssetId} = ${eventCount}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
