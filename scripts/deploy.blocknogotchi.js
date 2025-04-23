async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const Blocknogotchi = await ethers.getContractFactory("BlocknogotchiContract");
    const blocknogotchi = await Blocknogotchi.deploy();
    await blocknogotchi.waitForDeployment();

    console.log("Blocknogotchi contract deployed to:", await blocknogotchi.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });