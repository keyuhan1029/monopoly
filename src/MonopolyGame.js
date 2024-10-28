import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { loadContract } from './utils/load-contract';
import dice1 from './component/dice-1.png';
import dice2 from './component/dice-2.png';
import dice3 from './component/dice-3.png';
import dice4 from './component/dice-4.png';
import dice5 from './component/dice-5.png';
import dice6 from './component/dice-6.png';
import './MonopolyMap.css';

const diceImages = [dice1, dice2, dice3, dice4, dice5, dice6];

function MonopolyGame() {
    const [contract, setContract] = useState(null);
    const [playerPosition, setPlayerPosition] = useState(1);
    const [account, setAccount] = useState(null);
    const [diceResults, setDiceResults] = useState({ dice1: null, dice2: null });
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        const init = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                try {
                    const accounts = await web3Instance.eth.requestAccounts();
                    const accountToLarge = Web3.utils.toChecksumAddress(accounts[0]);
                    const monopolyGameContract = await loadContract('MonopolyGame', web3Instance);
                    setAccount(accountToLarge);
                    setContract(monopolyGameContract);
                    console.log('Contract loaded:', monopolyGameContract);

                    // 获取过去的事件
                    const pastEvents = await monopolyGameContract.getPastEvents('DiceRolled', {
                        filter: { player: accountToLarge },
                        fromBlock: 0,
                        toBlock: 'latest'
                    });
                    console.log("pastevent:", pastEvents);
                    if (pastEvents.length > 0) {
                        const lastEvent = pastEvents[pastEvents.length - 1];
                        const dice1 = Number(lastEvent.returnValues.dice1);
                        const dice2 = Number(lastEvent.returnValues.dice2);
                        setDiceResults({ dice1, dice2 });
                    }

                    // fatch player position
                    const positionEvents = await monopolyGameContract.getPastEvents('PlayerMoved', {filter: { player:accountToLarge},
                        fromBlock: 0,
                        toBlock: 'latest'
                    });
                    const lastPositionEvent = positionEvents[positionEvents.length - 1];
                    // console.log("test:", lastPositionEvent);
                    const position = Number(lastPositionEvent.returnValues.newPosition);
                    console.log("player position:", position);
                    setPlayerPosition(position);
                } catch (error) {
                    console.error('Error in loading contract or fetching past events:', error);
                }
            } else {
                console.error('No MetaMask extension detected!');
                alert('Please install MetaMask extension!');
            }
        };
        init();
    }, [playerPosition]);


    const movePlayer = async () => {
        if (contract && account) {
            try {
                await contract.methods.movePlayer().send({ from: account });

                // 讀取骰子資訊
                // 获取最新的事件
                const pastEvents = await contract.getPastEvents('DiceRolled', {
                    filter: { player: account },
                    fromBlock: 'latest'
                });
                console.log("pastEvent:", pastEvents);

                if (pastEvents.length > 0) {
                    const lastEvent = pastEvents[pastEvents.length - 1];
                    const dice1 = Number(lastEvent.returnValues.dice1);
                    const dice2 = Number(lastEvent.returnValues.dice2);
                    setDiceResults({ dice1, dice2 });
                }
                // 計算move到哪
                const newPosition = await contract.methods.playerPositions(account).call();
                console.log("new position:", newPosition);
                setPlayerPosition(newPosition);
            } catch (error) {
                console.error('Error moving player:', error);
                alert('Error moving player: ' + error.message);
            }
        }
    };

    const createCells = (start, end, reverse = false) => (
        Array.from({ length: end - start + 1 }, (_, index) => {
            const cellNumber = reverse ? end - index : start + index;
            const property = properties.find(prop => prop.propertyid === cellNumber);
            return (
                <div className={`cell ${playerPosition === cellNumber ? 'player' : ''}`} key={cellNumber}>
                    {property ? property.name : `Cell ${cellNumber}`}
                </div>
            );
        })
    );

    return (
        <div className="Home">
            <h1>Monopoly Game</h1>
            <div className="monopoly-map">
                <div className="top">{createCells(1, 10)}</div>
                <div className="right">{createCells(11, 20)}</div>
                <div className="bottom">{createCells(21, 30)}</div>
                <div className="left">{createCells(31, 40)}</div>
                <div className="dice-area">
                    {diceResults.dice1 !== null && diceResults.dice2 !== null && (
                        <>
                            <img src={diceImages[diceResults.dice1 - 1]} alt={`Dice ${diceResults.dice1}`} className="dice" />
                            <img src={diceImages[diceResults.dice2 - 1]} alt={`Dice ${diceResults.dice2}`} className="dice" />
                        </>
                    )}
                    {/* <button onClick={rollDice} className="roll-button">Roll</button> */} {/*因為應該要由move執行roll*/}
                </div>
            </div>
            <button onClick={movePlayer}>Move Player</button>
            {diceResults.dice1 !== null && diceResults.dice2 !== null && (
                <p>Dice Results: {diceResults.dice1}, {diceResults.dice2}</p>
            )}
            <h2>Player Positions</h2>
            <ul>
                {playerPosition}
            </ul>
        </div>
    );
}

export default MonopolyGame;
