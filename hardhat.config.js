require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.26",
  networks: {
    // sepolia: {
    //   url: process.env.SEPOLIA_URL,
    //   accounts: [process.env.PRIVATE_KEY]
    // },
    scrollSepolia: {
      url: process.env.SCROLL_SEPOLIA_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 534351, // Replace with the correct chain ID for Scroll Sepolia
      blockConfirmations: 2, // Ensure this line is added
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 84532,
      blockConfirmations: 2,
    },
    zircuitSepolia: {
      url: process.env.ZIRCUIT_SEPOLIA_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 48900, // Replace with the correct chain ID for Zircuit Sepolia
      blockConfirmations: 2,
    }
  },
  etherscan: {
    apiKey: {
      scrollSepolia: process.env.SCROLL_SEPOLIA_API_KEY,
      baseSepolia: process.env.BASE_SEPOLIA_API_KEY,
      zircuitSepolia: process.env.ZIRCUIT_SEPOLIA_API_KEY,
    },
  
  customChains: [
    {
      network: "scrollSepolia",
      chainId: 534351,
      urls: {
        apiURL: "https://api-sepolia.scrollscan.com/api", // Ensure this line is added
        browserURL: "https://sepolia.scrollscan.com/", // Ensure this line is added
      },
    },
    {
      network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/",
        },
    },
    {
      network: "zircuitSepolia",
      chainId: 123456, // Replace with the correct chain ID for Zircuit Sepolia
      urls: {
        apiURL: "https://zircuit1.p2pify.com/", // Replace with the correct API URL for Zircuit Sepolia
        browserURL: "https://explorer.zircuit.com", // Replace with the correct browser URL for Zircuit Sepolia
      },
    },
  ],
},
  sourcify: {
    // Disabled by default
  // Doesn't need an API key
  enabled: false
  }
};