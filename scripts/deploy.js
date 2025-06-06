async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const SupplyChainNFT = await ethers.getContractFactory("SupplyChainNFT");
    const supplyChainNFT = await SupplyChainNFT.deploy();
    await supplyChainNFT.waitForDeployment();

    console.log("SupplyChainNFT contract deployed to:", await supplyChainNFT.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });