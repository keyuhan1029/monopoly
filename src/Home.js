import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { loadContract } from "./utils/load-contract";
import './Home.css';
function Home() {
    const [web3Api, setWeb3Api] = useState();
    const [contract, setContract] = useState();
    const [account, setAccount] = useState(null);
    const [balances, setBalances] = useState({ coins: 0, lands: 0, houses: 0 });
  
    useEffect(() => {
      const init = async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          setWeb3Api(web3);
          try {
            const bigRichManGame = await loadContract("BigRichManGame", web3);
            setContract(bigRichManGame);
          } catch (error) {
            console.error("Error in loading contract:", error);
          }
        } else {
          console.error("No MetaMask extension detected!");
          alert("Please install MetaMask extension!");
        }
      };
      init();
    }, []);
  
    useEffect(() => {
        const loadBalances = async () => {
          if (account && contract) {
            console.log("Fetching balances for", account);
            const coinBalance = await contract.methods.balanceOf(account, 0).call();
            const landBalance = await contract.methods.balanceOf(account, 1).call();
            const houseBalance = await contract.methods.balanceOf(account, 2).call();
            console.log("Balances:", coinBalance, landBalance, houseBalance);
            setBalances({
                coins: coinBalance.toString(),
                lands: landBalance.toString(),
                houses: houseBalance.toString()
              });
          }
        };
        loadBalances();
      }, [account, contract]);
  
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await web3Api.eth.requestAccounts();
          setAccount(accounts[0]);
          console.log("Connected account:", accounts[0]);
        } catch (error) {
          console.error("User denied account access");
        }
      } else {
        console.error("No Ethereum provider detected. Install MetaMask or another wallet provider.");
      }
    };
  
    // 定義 mintLand 函數
    const mintLand = async () => {
      try {
        await contract.methods.mint(account, 1, 1).send({ from: account });
        alert("Land minted successfully!");
      } catch (error) {
        console.error("Error minting land:", error);
        alert("Error in transaction: " + error.message);
      }
    };
  
    // 定義 mintHouse 函數
    const mintHouse = async () => {
      try {
        await contract.methods.mintHouse(account, "http://example.com/house1.json").send({ from: account });
        alert("House minted successfully!");
      } catch (error) {
        console.error("Error minting house:", error);
        alert("Error in transaction: " + error.message);
      }
    };
  
    // // 定義 transferToken 函數
    // const transferToken = async () => {
    //   try {
    //     await contract.methods.transferToken("0xRecipientAddress", 1, 1).send({ from: account });
    //     alert("Token transferred successfully!");
    //   } catch (error) {
    //     console.error("Error transferring token:", error);
    //     alert("Error in transaction: " + error.message);
    //   }
    // };
  
    return (
      <div className="Home">
        <button onClick={connectWallet}>Connect Wallet</button>
        {account && (
          <>
            <p>Connected account: {account}</p>
            <p>Coins: {balances.coins}</p>
            <p>Lands: {balances.lands}</p>
            <p>Houses: {balances.houses}</p>
          </>
        )}
        <button onClick={mintLand} disabled={!account}>Mint Land</button>
        <button onClick={mintHouse} disabled={!account}>Mint House</button>
        {/* <button onClick={transferToken} disabled={!account}>Transfer Token</button> */}
      </div>
    );
  }
  
  export default Home;
  