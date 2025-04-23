async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const BlockmonMarketplace = await ethers.getContractFactory("BlockmonMarketplace");
    const blockmonMarketplace = await BlockmonMarketplace.deploy('0xe1e52a36E15eBf6785842e55b6d1D901819985ec', 100);  
    await blockmonMarketplace.waitForDeployment();

    console.log("Blockmon Marketplace contract deployed to:", blockmonMarketplace.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });