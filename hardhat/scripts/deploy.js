const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {
  //await deployRewardToken();
  //await Verify("0x6080B856B22F52ffC4702B3251d43d93C7748875")
  
  //await deployNFT();
  //await Verify("0x98228513B13FFb38bfDA58CA16FCB6A1E6B26c3B", ["ipfs://Qmf2nYieX65DP8hNnbvLTp6f3GPyjbqrnFXfw9c7hT9RaY/"])
}

async function deployRewardToken() {
  const tokenContract = await ethers.getContractFactory("RewardToken");
  const deployedTokenContract = await tokenContract.deploy();
  await deployedTokenContract.deployed();
  console.log("RewardToken Contract Address:", deployedTokenContract.address);
  // Last: 0x6080B856B22F52ffC4702B3251d43d93C7748875
}
async function deployNFT() {
  const metadataURL = "ipfs://Qmf2nYieX65DP8hNnbvLTp6f3GPyjbqrnFXfw9c7hT9RaY/";
  const nftContract = await ethers.getContractFactory("NFT");
  const deployedNFTContract = await nftContract.deploy(metadataURL);
  await deployedNFTContract.deployed();
  console.log("NFT Contract Address:", deployedNFTContract.address);
  // Last: 0x98228513B13FFb38bfDA58CA16FCB6A1E6B26c3B
}

async function Verify(address, constructorArguments) {
  await hre.run("verify:verify", {
    address: address,
    constructorArguments: constructorArguments,
  });
}

// npx hardhat compile
// npx hardhat run scripts/deploy.js --network goerli

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
