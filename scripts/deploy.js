async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const Increment = await ethers.getContractFactory("TrafficViolation");
    const increment = await Increment.deploy();
    await increment.waitForDeployment();

    console.log("Increment contract deployed to:", await increment.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });