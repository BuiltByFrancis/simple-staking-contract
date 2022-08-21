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

  const updateRewardTokenBalances = async () => {
    try {
      const provider = await getProviderOrSigner(true);
      const rewardTokenContract = new Contract(
        rewardTokenContractAddress,
        rewardTokenABI,
        provider
      );

      const user = await rewardTokenContract.balanceOf(await provider.getAddress());
      const contract = await rewardTokenContract.balanceOf(
        rewardTokenContractAddress
      );

      setUserTokenBalance(utils.formatUnits(user, 18));
      setContractTokenBalance(utils.formatUnits(contract, 18));
    } catch (err) {
      console.error(err);
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

      setInterval(async function () {
        await updateRewardTokenBalances();
      }, 5000); // 5 seconds
    }
  }, [walletConnected]);

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
        <button className={styles.button} onClick={connectWallet}>Connect</button>
      </div>
    </div>
  );
}
