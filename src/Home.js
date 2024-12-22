import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { loadContract } from "./utils/load-contract";
import './Home.css';
function Home() {
    const [web3Api, setWeb3Api] = useState();
    const [contract, setContract] = useState();
    const [account, setAccount] = useState(null);
    const [balances, setBalances] = useState({ coins: 0, lands: 0});
    const [reloadBalances, setReloadBalances] = useState(false);

    useEffect(() => {
      const init = async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          setWeb3Api(web3);
          try {
            const Token = await loadContract("Token", web3);
            setContract(Token);
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
            // const houseBalance = await contract.methods.balanceOf(account, 2).call();
            console.log("Balances:", coinBalance, landBalance);
            setBalances({
                coins: coinBalance.toString(),
                lands: landBalance.toString(),
                // houses: houseBalance.toString()
              });
          }
        };
        loadBalances();
      }, [account, contract, reloadBalances]);

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
    // const mintLand = async () => {
    //   try {
    //     await contract.methods.mint(account, 1, 1).send({ from: account });
    //     alert("Land minted successfully!");
    //   } catch (error) {
    //     console.error("Error minting land:", error);
    //     alert("Error in transaction: " + error.message);
    //   }
    // };
    //
    // // 定義 mintHouse 函數
    // const mintHouse = async () => {
    //   try {
    //     await contract.methods.mintHouse(account, "http://example.com/house1.json").send({ from: account });
    //     alert("House minted successfully!");
    //   } catch (error) {
    //     console.error("Error minting house:", error);
    //     alert("Error in transaction: " + error.message);
    //   }
    // };

    const mintItem = async (id, amount) => {
        try {
            const receipt = await contract.methods.mint(account, id, amount, "0x").send({ from: account });
            console.log("Transaction receipt:", receipt);

            alert(`Item with ID ${id} and amount ${amount} minted successfully!`);

            // 延遲狀態更新，避免競態問題
            setTimeout(() => {
                setReloadBalances((prev) => !prev);
            }, 100);
        } catch (error) {
            console.error(`Error minting item with ID ${id}:`, error);
            alert("Error in transaction: " + error.message);
        }
    };

    return (
        <div className="Home">
            <button onClick={connectWallet}>Connect Wallet</button>
            {account && (
                <>
                    <p>Connected account: {account}</p>
                    <p>Coins: {balances.coins}</p>
                    <p>Lands: {balances.lands}</p>
                    {/*<p>Houses: {balances.houses}</p>*/}
                </>
            )}
            <button onClick={() => mintItem(0, 1000)} disabled={!account}>Mint money</button>
            <button onClick={() => mintItem(1, 1)} disabled={!account}>Mint</button>
            {/* <button onClick={transferToken} disabled={!account}>Transfer Token</button> */}
        </div>
    );
}

export default Home;
