async function main() {
  // Contract address from deployment
  const contractAddress = "0xF8e0d0Ff7bA57733633fD5aF8E0041011EaF9c5e";
  
  // Constructor arguments
  const initialOwner = "0x93Ab4B67E111FcD35D58CfA10E1a433114E82A5a";
  const companyWallet = "0xD9Ed4bE7270c4a0f4aE70a013eE8Ca2F4113A596";

  if (!contractAddress || !initialOwner || !companyWallet) {
    console.error("Missing environment variables. Please set DONATION_TRACKER_ADDRESS, INITIAL_OWNER, and COMPANY_WALLET.");
    process.exit(1);
  }

  console.log("Verifying DonationTracker contract...");
  console.log("Contract Address:", contractAddress);
  console.log("Initial Owner:", initialOwner);
  console.log("Company Wallet:", companyWallet);
  
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [initialOwner, companyWallet],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 