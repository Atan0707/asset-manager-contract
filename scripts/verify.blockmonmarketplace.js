async function main() {
  const contractAddress = "0xb5960bDa72Dba8693c4376bca91C166E10CDe75A";
  const tokenAddress = "0xe1e52a36E15eBf6785842e55b6d1D901819985ec";
  const feePercentage = 100;

  console.log("Verifying BlockmonMarketplace contract...");
  
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [tokenAddress, feePercentage],
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