const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Blocknogotchi", function () {
  let blocknogotchi;
  let owner;
  let user1;
  let user2;
  
  // Enum values from the contract
  const Attribute = {
    FIRE: 0,
    WATER: 1,
    PLANT: 2,
    ELECTRIC: 3,
    EARTH: 4,
    AIR: 5,
    LIGHT: 6,
    DARK: 7
  };
  
  const Rarity = {
    COMMON: 0,
    UNCOMMON: 1,
    RARE: 2,
    EPIC: 3,
    LEGENDARY: 4
  };

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy the contract
    const BlocknogotchiFactory = await ethers.getContractFactory("BlocknogotchiContract");
    blocknogotchi = await BlocknogotchiFactory.deploy();
    await blocknogotchi.waitForDeployment();
  });

  describe("Creation and Claiming", function () {
    it("Should create a new Blocknogotchi", async function () {
      const tx = await blocknogotchi.createBlocknogotchi(
        "FirePet",
        Attribute.FIRE,
        Rarity.COMMON,
        "ipfs://metadata/1"
      );
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      // Find the BlocknogotchiCreated event
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'BlocknogotchiCreated'
      );
      
      expect(event).to.not.be.undefined;
      const tokenId = event.args[0];
      
      // Check the Blocknogotchi data
      const pet = await blocknogotchi.getBlocknogotchi(tokenId);
      expect(pet.name).to.equal("FirePet");
      expect(pet.attribute).to.equal(Attribute.FIRE);
      expect(pet.rarity).to.equal(Rarity.COMMON);
      expect(pet.claimed).to.be.false;
    });

    it("Should allow claiming a Blocknogotchi with valid hash", async function () {
      // Create a Blocknogotchi and get its claim hash
      const result = await blocknogotchi.createBlocknogotchi(
        "WaterPet",
        Attribute.WATER,
        Rarity.UNCOMMON,
        "ipfs://metadata/2"
      );
      
      const receipt = await result.wait();
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'BlocknogotchiCreated'
      );
      const tokenId = event.args[0];
      
      // Get the claim hash from the return value
      // Note: This is a bit tricky in tests since the hash is returned but not emitted
      // For testing purposes, we can get the tokenId and then find the hash
      const createTx = await ethers.provider.getTransaction(receipt.hash);
      const decodedData = blocknogotchi.interface.decodeFunctionResult(
        "createBlocknogotchi",
        await ethers.provider.call({
          to: await blocknogotchi.getAddress(),
          data: createTx.data,
        })
      );
      const claimHash = decodedData[1];
      
      // Claim the Blocknogotchi as user1
      await blocknogotchi.connect(user1).claimBlocknogotchi(claimHash);
      
      // Check that it's claimed and owned by user1
      const pet = await blocknogotchi.getBlocknogotchi(tokenId);
      expect(pet.claimed).to.be.true;
      expect(pet.owner).to.equal(user1.address);
    });

    it("Should not allow claiming with an invalid hash", async function () {
      const invalidHash = ethers.keccak256(ethers.toUtf8Bytes("invalid"));
      await expect(
        blocknogotchi.claimBlocknogotchi(invalidHash)
      ).to.be.revertedWith("Invalid or expired hash");
    });
  });

  describe("Battle and Experience", function () {
    let tokenId1, tokenId2, claimHash1, claimHash2;

    beforeEach(async function () {
      // Create and claim two Blocknogotchis
      const result1 = await blocknogotchi.createBlocknogotchi(
        "Fighter1",
        Attribute.FIRE,
        Rarity.COMMON,
        "ipfs://metadata/3"
      );
      const receipt1 = await result1.wait();
      const event1 = receipt1.logs.find(
        log => log.fragment && log.fragment.name === 'BlocknogotchiCreated'
      );
      tokenId1 = event1.args[0];
      
      const result2 = await blocknogotchi.createBlocknogotchi(
        "Fighter2",
        Attribute.WATER,
        Rarity.COMMON,
        "ipfs://metadata/4"
      );
      const receipt2 = await result2.wait();
      const event2 = receipt2.logs.find(
        log => log.fragment && log.fragment.name === 'BlocknogotchiCreated'
      );
      tokenId2 = event2.args[0];
      
      // Get claim hashes
      const createTx1 = await ethers.provider.getTransaction(receipt1.hash);
      const decodedData1 = blocknogotchi.interface.decodeFunctionResult(
        "createBlocknogotchi",
        await ethers.provider.call({
          to: await blocknogotchi.getAddress(),
          data: createTx1.data,
        })
      );
      claimHash1 = decodedData1[1];
      
      const createTx2 = await ethers.provider.getTransaction(receipt2.hash);
      const decodedData2 = blocknogotchi.interface.decodeFunctionResult(
        "createBlocknogotchi",
        await ethers.provider.call({
          to: await blocknogotchi.getAddress(),
          data: createTx2.data,
        })
      );
      claimHash2 = decodedData2[1];
      
      // Claim both Blocknogotchis
      await blocknogotchi.connect(user1).claimBlocknogotchi(claimHash1);
      await blocknogotchi.connect(user2).claimBlocknogotchi(claimHash2);
    });

    it("Should record battle results and award experience", async function () {
      // Set a short battle cooldown for testing
      await blocknogotchi.setBattleCooldown(1); // 1 second cooldown
      
      // Record a battle (owner can do this since we haven't set a battle oracle)
      await blocknogotchi.recordBattle(tokenId1, tokenId2, 50, 20);
      
      // Check battle stats for winner
      const winner = await blocknogotchi.getBlocknogotchi(tokenId1);
      expect(winner.battleCount).to.equal(1);
      expect(winner.battleWins).to.equal(1);
      expect(winner.experience).to.equal(50);
      
      // Check battle stats for loser
      const loser = await blocknogotchi.getBlocknogotchi(tokenId2);
      expect(loser.battleCount).to.equal(1);
      expect(loser.battleWins).to.equal(0);
      expect(loser.experience).to.equal(20);
    });

    it("Should level up when enough experience is gained", async function () {
      // Award enough experience to level up
      await blocknogotchi.recordBattle(tokenId1, tokenId2, 100, 50);
      
      // Check level up for winner
      const winner = await blocknogotchi.getBlocknogotchi(tokenId1);
      expect(winner.level).to.equal(2); // Level should increase from 1 to 2
      expect(winner.experience).to.equal(100);
      
      // Award more experience to level up again
      await blocknogotchi.recordBattle(tokenId1, tokenId2, 150, 50);
      
      const winnerAfterSecondBattle = await blocknogotchi.getBlocknogotchi(tokenId1);
      expect(winnerAfterSecondBattle.level).to.equal(3); // Level should increase from 2 to 3
      expect(winnerAfterSecondBattle.experience).to.equal(250);
    });
  });

  describe("Evolution", function () {
    let tokenId;
    
    beforeEach(async function () {
      // Create and claim a Blocknogotchi
      const result = await blocknogotchi.createBlocknogotchi(
        "EvolvePet",
        Attribute.PLANT,
        Rarity.COMMON,
        "ipfs://metadata/5"
      );
      const receipt = await result.wait();
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'BlocknogotchiCreated'
      );
      tokenId = event.args[0];
      
      // Get claim hash
      const createTx = await ethers.provider.getTransaction(receipt.hash);
      const decodedData = blocknogotchi.interface.decodeFunctionResult(
        "createBlocknogotchi",
        await ethers.provider.call({
          to: await blocknogotchi.getAddress(),
          data: createTx.data,
        })
      );
      const claimHash = decodedData[1];
      
      // Claim the Blocknogotchi
      await blocknogotchi.connect(user1).claimBlocknogotchi(claimHash);
      
      // Manually set the evolution level to a lower value for testing
      await blocknogotchi.connect(owner).setBattleCooldown(1); // 1 second cooldown
    });

    it("Should check if a Blocknogotchi is ready to evolve", async function () {
      // Initially not ready to evolve
      expect(await blocknogotchi.checkEvolution(tokenId)).to.be.false;
      
      // Award enough experience to reach evolution level
      // We need to give it enough XP to reach level 30 (EVOLUTION_LEVEL)
      // Level 30 requires 29 * 100 = 2900 XP
      
      // Let's do this in multiple battles to avoid gas limits
      await blocknogotchi.setBattleCooldown(0);
      for (let i = 0; i < 10; i++) {
        await blocknogotchi.recordBattle(tokenId, tokenId, 300, 0);
      }
      
      // Check if ready to evolve
      expect(await blocknogotchi.checkEvolution(tokenId)).to.be.true;
    });

    it("Should evolve a Blocknogotchi when ready", async function () {
      // Award enough experience to reach evolution level
      for (let i = 0; i < 10; i++) {
        await blocknogotchi.recordBattle(tokenId, tokenId, 300, 0);
      }
      
      // Evolve the Blocknogotchi
      await blocknogotchi.connect(user1).evolve(tokenId, "EvolvedPet", "ipfs://metadata/evolved");
      
      // Check the evolved Blocknogotchi
      const pet = await blocknogotchi.getBlocknogotchi(tokenId);
      expect(pet.name).to.equal("EvolvedPet");
      expect(pet.rarity).to.equal(Rarity.UNCOMMON); // Evolved from COMMON to UNCOMMON
      expect(pet.tokenURI).to.equal("ipfs://metadata/evolved");
    });
  });
}); 