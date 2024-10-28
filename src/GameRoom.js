import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { loadContract } from "./utils/load-contract";
import './GameRoom.css';

function GameRoom() {
  const [web3Api, setWeb3Api] = useState();
  const [contract, setContract] = useState();
  const [account, setAccount] = useState(null); // 使用者帳戶狀態
  const [maxPlayers, setMaxPlayers] = useState(4); // 房間最大玩家數量
  const [gameMode, setGameMode] = useState("Standard"); // 遊戲模式
  const [password, setPassword] = useState(""); // 房間密碼
  const [roomId, setRoomId] = useState(""); // 房間ID
  const [joinPassword, setJoinPassword] = useState(""); // 加入房間密碼

  const [inRoomId, setInRoomId] = useState(null); // 成功創建的房間ID
  const [isCreating, setIsCreating] = useState(false); // 創建房間狀態
  const [isJoining, setIsJoining] = useState(false); // 加入房間狀態
  const [roomPlayerInfo, setRoomPlayerInfo] = useState({ maxPlayers: 0, currentPlayers: 0 }); // 房間玩家信息

  useEffect(() => {
    const init = async () => {
      // load metamask
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        setWeb3Api(web3);
        // load contract
        try {
          const MonopolyContract = await loadContract("MonopolyGame", web3);
          console.log(MonopolyContract);
          setContract(MonopolyContract);
          // connect account
          const accounts = await web3.eth.requestAccounts();
          const accountToLarge = Web3.utils.toChecksumAddress(accounts[0]);
          setAccount(accountToLarge);  // 轉成有大小寫區別的 address
          console.log("Connected account:", accountToLarge);
          // console.log(Web3.utils.toChecksumAddress(accounts[0]).length)
          const roomsCount = Number(await MonopolyContract.methods.nextRoomId().call()) - 1;
          // console.log(roomsCount);
          if(roomsCount > 0){
            for (let i = 1; i <= roomsCount; i++) {
              const room = await MonopolyContract.methods.getRoom(i).call();
              if (room.creator === accountToLarge || room.players.includes(accountToLarge)) {
                setInRoomId(i.toString());
                await fetchRoomPlayerInfo(i);
                break;
              }
            }
          }
        } catch (error) {
          console.error("Error in loading contract or connecting account:", error);
        }
      } else {
        console.error("No metamask extension detected!");
        alert("Please install metamask extension!!");
      }
    }
    init();
  }, []);

  const fetchRoomPlayerInfo = async (roomId) => {
    if (contract) {
      try {
        const result = await contract.methods.checkPlayerNumInRoom(roomId).call();
        console.log(result);
        setRoomPlayerInfo({
          maxPlayers: Number(result[0]),
          currentPlayers: Number(result[1]),
        });
      } catch (error) {
        console.error("Error in fetching room player info:", error);
      }
    }
  };

  // 創建房間
  const createRoom = async () => {
    if (account) {
      setIsCreating(true);  
      try {
        const result = await contract.methods.createRoom(maxPlayers, gameMode, password).send({ from: account, value: web3Api.utils.toWei('1', 'ether')});
        const newRoomId = Number(result.events.RoomCreated.returnValues.roomId);
        setInRoomId(newRoomId);
        await fetchRoomPlayerInfo(newRoomId);  // 獲取房間玩家信息
        console.log("Room created with ID:", newRoomId);
        alert(`Room created successfully with ID: ${newRoomId}`);  
      } catch (error) {
        console.error("Error in create game room: ", error);
        alert("Error in contract transaction: " + error.message);
      }
      setIsCreating(false);
    }
  };

  // 加入房間
  const joinRoom = async () => {
    if (account) {
      setIsJoining(true);
      try {
        await contract.methods.joinRoom(roomId, joinPassword).send({ from: account, value: web3Api.utils.toWei('1', 'ether')});
        setInRoomId(roomId); // 更新createdRoomId
        await fetchRoomPlayerInfo(roomId);  // 獲取房間玩家信息
        console.log("Joined room:", roomId);
        alert(`Joined room successfully with ID: ${roomId}`);
      } catch (error) {
        console.error("Error in joining room: ", error);
        alert("Error in contract transaction: " + error.message);
      }
      setIsJoining(false);
    }
  };

  // 離開房間
  const leaveRoom = async () => {
    if (account) {
      try {
        await contract.methods.leaveRoom(inRoomId).send({ from: account });
        console.log("Left room with ID:", inRoomId);
        alert(`Left room successfully with ID: ${inRoomId}`);
        setInRoomId(null); // 清除房間ID
        setRoomPlayerInfo({ maxPlayers: 0, currentPlayers: 0 });  // 清除房間玩家信息
      } catch (error) {
        console.error("Error in leaving room: ", error);
        alert("Error in contract transaction: " + error.message);
      }
    }
  };

  // 測試用
  // 退款函數
  const refund = async () => {
    if (account) {
      try {
        await contract.methods.refund(inRoomId).send({ from: account });
        console.log("Refunded for room ID:", inRoomId);
        alert(`Refunded successfully for room ID: ${inRoomId}`);
        setInRoomId(null); // 清除房間ID
        setRoomPlayerInfo({ maxPlayers: 0, currentPlayers: 0 });  // 清除房間玩家信息
      } catch (error) {
        console.error("Error in refund transaction: ", error);
        alert("Error in contract transaction: " + error.message);
      }
    }
  };

  return (
    <div className="GameRoom">
      {account && <p>Connected account: {account}</p>}
      {inRoomId !== null && (
        <div>
          <p>You are already in room with ID: {inRoomId}</p>
          <p>Waiting for more players join to start {roomPlayerInfo.currentPlayers}/{roomPlayerInfo.maxPlayers}</p>
          <p><b>Start the MonopolyGame now!!!</b></p>
          <button onClick={leaveRoom} disabled={!account}>Leave Room</button>
          <button onClick={refund} disabled={!account}>Refund</button> {/* test */}
        </div>
      )}

      <div>
        <h2>Create Room</h2>
        <label>
          Max Players:
          <input
            type="number"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(e.target.value)}
          />
        </label>
        <br />
        <label>
          Game Mode:
          <select
            value={gameMode}
            onChange={(e) => setGameMode(e.target.value)}
          >
            <option value="Standard">Standard</option>
            <option value="Quick">Quick</option>
          </select>
        </label>
        <br />
        <label>
          Password:
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <br />
        <button onClick={createRoom} disabled={!account || isCreating || inRoomId !== null}>Create Room</button>
      </div>

      <div>
        <h2>Join Room</h2>
        <label>
          Room ID:
          <input
            type="number"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="text"
            value={joinPassword}
            onChange={(e) => setJoinPassword(e.target.value)}
          />
        </label>
        <br />
        <button onClick={joinRoom} disabled={!account || isJoining || inRoomId !== null}>Join Room</button>
      </div>

      {/* {account === contract.options.address && (
        <div>
          <h2>Withdraw Funds</h2>
          <button onClick={withdrawFunds} disabled={!account}>Withdraw</button>
        </div>
      )} */}
    </div>
  )
}

export default GameRoom;
