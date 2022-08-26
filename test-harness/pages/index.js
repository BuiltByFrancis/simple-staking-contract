import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Contract, providers, utils } from "ethers";
import {
  rewardTokenContractAddress,
  nftContractAddress,
  rewardTokenABI,
  nftABI,
} from "../constants";
import Web3Modal from "web3modal";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userTokenBalance, setUserTokenBalance] = useState("0");
  const [contractTokenBalance, setContractTokenBalance] = useState("0");
  const [userNftBalance, setNFTBalance] = useState("0");
  const [totalMintedNfts, setMintedNFTS] = useState("0");
  const web3ModalRef = useRef();

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId != 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const updateNftData = async () => {
    try {
      const provider = await getProviderOrSigner(true);
      const nftContract = new Contract(nftContractAddress, nftABI, provider);

      const user = await nftContract.balanceOf(await provider.getAddress());
      const contract = await nftContract._tokenId();

      setNFTBalance(utils.formatUnits(user, 0));
      setMintedNFTS(utils.formatUnits(contract, 0));
    } catch (err) {
      console.error(err);
    }
  };

  const updateRewardTokenBalances = async () => {
    try {
      const provider = await getProviderOrSigner(true);
      const rewardTokenContract = new Contract(
        rewardTokenContractAddress,
        rewardTokenABI,
        provider
      );

      const user = await rewardTokenContract.balanceOf(
        await provider.getAddress()
      );
      const contract = await rewardTokenContract.balanceOf(
        rewardTokenContractAddress
      );

      setUserTokenBalance(utils.formatUnits(user, 18));
      setContractTokenBalance(utils.formatUnits(contract, 18));
    } catch (err) {
      console.error(err);
    }
  };

  const sendTokensToContract = async () => {
    const provider = await getProviderOrSigner(true);
    const rewardTokenContract = new Contract(
      rewardTokenContractAddress,
      rewardTokenABI,
      provider
    );

    setLoading(true);
    try {
      const tx = await rewardTokenContract.transfer(
        rewardTokenContractAddress,
        utils.parseEther("100")
      );
      await tx.wait();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const mint = async () => {
    const provider = await getProviderOrSigner(true);
    const nftContract = new Contract(nftContractAddress, nftABI, provider);

    if (totalMintedNfts < 10) {
      setLoading(true);
      try {
        const tx = await nftContract.mint({
          value: utils.parseEther("0.01"),
        });
        await tx.wait();
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    } else {
      window.alert("All gone lol");
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet();
      updateRewardTokenBalances();
      updateNftData();

      setInterval(async function () {
        await updateRewardTokenBalances();
        await updateNftData();
      }, 5000); // 5 seconds
    }
  }, [walletConnected]);

  const Button = ({ title, onClick }) => {
    return (
      <button disabled={loading ? "disabled" : ""} onClick={onClick}>
        {loading ? "Loading..." : title}
      </button>
    );
  };

  return (
    <div className={styles.container}>
      <div>
        <label>WalletConnected: {walletConnected ? "true" : "false"}</label>
      </div>
      <div>
        <label>Loading: {loading ? "true" : "false"}</label>
      </div>
      <div>
        <label>User Token Balance: {userTokenBalance}</label>
      </div>
      <div>
        <label>Contract Token Balance: {contractTokenBalance}</label>
      </div>
      <div>
        <label>Unstaked Nfts: {userNftBalance}</label>
      </div>
      <div>
        <label>Total Minted NFTS: {totalMintedNfts}</label>
      </div>
      <div>
        <Button title={"Mint"} onClick={mint} />
        <Button title={"Send 100 to contract"} onClick={sendTokensToContract} />
        <Button title={"Connect"} onClick={connectWallet} />
      </div>
    </div>
  );
}
