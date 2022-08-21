const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, waffle } = require("hardhat");

describe("NFT Contract", function () {
  var baseURI = "ipfs://Qmf2nYieX65DP8hNnbvLTp6f3GPyjbqrnFXfw9c7hT9RaY/";
  var _nftContract;

  beforeEach(async function () {
    // Deploy the reward token
    const nftContract = await ethers.getContractFactory("NFT");
    _nftContract = await nftContract.deploy(baseURI);
    await _nftContract.deployed();
  });

  describe("tokenURI", async function () {
    it("should return the expected json file for a minted token", async function () {
      await _nftContract.mint({
        value: ethers.utils.parseEther("0.01"),
      })

      expect(await _nftContract.tokenURI(1)).to.equal("ipfs://Qmf2nYieX65DP8hNnbvLTp6f3GPyjbqrnFXfw9c7hT9RaY/1.json")
    });

    it("should return an empty string if the base uri is empty", async function () {
      const nftContract = await ethers.getContractFactory("NFT");
      sut = await nftContract.deploy("");
      await sut.deployed();

      await sut.mint({
        value: ethers.utils.parseEther("0.01"),
      })

      expect(await sut.tokenURI(1)).to.equal("")
    });

    it("should revert if the token does not exist", async function () {
      await expect(_nftContract.tokenURI(1)).to.be.revertedWithCustomError(_nftContract, "missingToken");
    });
  });

  describe("mint", async function () {
    it("should mint a single nft to the callers wallet", async function () {
      const [owner] = await ethers.getSigners();

      expect(await _nftContract.balanceOf(owner.address)).to.equal(0);

      await _nftContract.mint({
        value: ethers.utils.parseEther("0.01"),
      })

      expect(await _nftContract.balanceOf(owner.address)).to.equal(1);
    });

    it("should revert when the max supply has been reached", async function () {
      for (var i = 0; i < 10; i++) {
        await _nftContract.mint({
          value: ethers.utils.parseEther("0.01"),
        })
      }

      await expect(_nftContract.mint({
        value: ethers.utils.parseEther("0.01"),
      })).to.be.revertedWithCustomError(_nftContract, "exceededSupply");
    });

    it("should revert if to little eth is sent", async function () {
      await expect(_nftContract.mint({
        value: ethers.utils.parseEther("0.001"),
      })).to.be.revertedWithCustomError(_nftContract, "insufficientFunds");
    });

    it("should revert when the contract is paused", async function () {
      await _nftContract.setPaused(true);

      await expect(_nftContract.mint({
        value: ethers.utils.parseEther("0.001"),
      })).to.be.revertedWithCustomError(_nftContract, "notRunning");
    });
  });

  describe("setPaused", async function () {
    it("should set the value of paused", async function () {
      const initialPaused = await _nftContract._paused();

      await _nftContract.setPaused(!initialPaused);
      expect(await _nftContract._paused()).to.equal(!initialPaused);
    });
  });

  describe("withdraw", async function () {
    it("Should withdraw the funds", async function () {
      const [owner] = await ethers.getSigners();

      // Send 1 eth to the contract
      await owner.sendTransaction({
        to: _nftContract.address,
        value: ethers.utils.parseEther("1.0"),
      });

      expect(await ethers.provider.getBalance(_nftContract.address)).to.equal(
        ethers.utils.parseEther("1.0")
      );

      const balanceBefore = await ethers.provider.getBalance(owner.address);
      await _nftContract.withdraw();
      const balanceAfter = await ethers.provider.getBalance(owner.address);

      expect(balanceAfter).to.be.greaterThan(balanceBefore);

      expect(await ethers.provider.getBalance(_nftContract.address)).to.equal(
        BigNumber.from(0)
      );
    });

    it("should revert when called by anyone but the owner", async function () {
      const [_, user] = await ethers.getSigners();

      await expect(_nftContract.connect(user).withdraw()).to.be.revertedWith("Ownable: caller is not the owner")
    });
  });
});
