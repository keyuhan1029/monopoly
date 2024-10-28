import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Web3 from "web3";
import Navbar from './Navbar.js';
import Home from './Home.js';
import GameRoom from './GameRoom.js';
import { loadContract } from "./utils/load-contract";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MonopolyGame from './MonopolyGame.js';


function App() {
  const [web3Api, setWeb3Api] = useState();
  const [contract, setContract] = useState();
  const [tokenCoinBalance, setTokenCoinBalance] = useState(0);

  useEffect(() => {
    const init = async () => {
      // load metamask
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        setWeb3Api(web3);
        // load contract
        try {
          const contract = await loadContract("BigRichManGame", web3);
          // console.log(contract);
          setContract(contract);
        } catch (error) {
          console.error("Error in loading contract:", error);
        }

      } else {
        console.error("No metamask extension detected!");
        alert("Please install metamask extension!!");
      }
    }

    init();
  }, [])
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className='content'>
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route exact path='/MonopolyGame/' element={<MonopolyGame />} />
              <Route exact path="/GameRoom/" element={<GameRoom />} />
            </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
