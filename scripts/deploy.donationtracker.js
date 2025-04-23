async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

    // Get owner and company wallet addresses
    const initialOwner = "0x93Ab4B67E111FcD35D58CfA10E1a433114E82A5a";
    const companyWallet = "0xD9Ed4bE7270c4a0f4aE70a013eE8Ca2F4113A596";

    // Deploy DonationTracker contract
    const DonationTracker = await ethers.getContractFactory("DonationTracker");
    const donationTracker = await DonationTracker.deploy(initialOwner, companyWallet);
    await donationTracker.waitForDeployment();

    const donationTrackerAddress = await donationTracker.getAddress();
    console.log("DonationTracker contract deployed to:", donationTrackerAddress);
    console.log("Initial owner:", initialOwner);
    console.log("Company wallet:", companyWallet);

    // Save the contract addresses for verification
    console.log("Save this information for verification:");
    console.log(`Contract Address: ${donationTrackerAddress}`);
    console.log(`Initial Owner: ${initialOwner}`);
    console.log(`Company Wallet: ${companyWallet}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 