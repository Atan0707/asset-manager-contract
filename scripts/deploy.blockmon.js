async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const Blockmon = await ethers.getContractFactory("Blockmon");
    const blockmon = await Blockmon.deploy();
    await blockmon.waitForDeployment();

    console.log("Blockmon contract deployed to:", blockmon.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });