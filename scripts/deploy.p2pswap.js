async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    
    // Blockmon contract address
    const blockmonContractAddress = "0xe1e52a36E15eBf6785842e55b6d1D901819985ec";
    
    const P2PSwap = await ethers.getContractFactory("P2PSwap");
    const p2pswap = await P2PSwap.deploy('0xe1e52a36E15eBf6785842e55b6d1D901819985ec');
    await p2pswap.waitForDeployment();

    console.log("P2PSwap contract deployed to:", p2pswap.target);
    console.log("Using Blockmon contract:", blockmonContractAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });