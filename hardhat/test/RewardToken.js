const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, waffle } = require("hardhat");

describe("deploy RewardToken", function () {
  var _rewardTokenContract;

  beforeEach(async function () {
    // Deploy the reward token
    const rewardTokenContract = await ethers.getContractFactory("RewardToken");
    _rewardTokenContract = await rewardTokenContract.deploy();
    await _rewardTokenContract.deployed();
  });

  it("Should send 10000 tokens to the deployer wallet", async function () {
    const [owner, addr1] = await ethers.getSigners();

    expect(await _rewardTokenContract.balanceOf(owner.address)).to.equal(
      ethers.utils.parseUnits("10000", 18)
    );
    expect(await _rewardTokenContract.balanceOf(addr1.address)).to.equal(
      BigNumber.from(0)
    );
  });

  it("Should withdraw the funds", async function () {
    const [owner] = await ethers.getSigners();

    // Send 1 eth to the contract
    await owner.sendTransaction({
        to: _rewardTokenContract.address,
        value: ethers.utils.parseEther("1.0"),
    });
    
    expect(await ethers.provider.getBalance(_rewardTokenContract.address)).to.equal(
        ethers.utils.parseEther("1.0")
    );

    const balanceBefore = await ethers.provider.getBalance(owner.address)
    await _rewardTokenContract.Withdraw();
    const balanceAfter = await ethers.provider.getBalance(owner.address)

    expect(balanceAfter).to.be.greaterThan(balanceBefore)

    expect(await ethers.provider.getBalance(_rewardTokenContract.address)).to.equal(
      BigNumber.from(0)
    );
  });
});
