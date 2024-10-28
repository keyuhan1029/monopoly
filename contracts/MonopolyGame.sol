// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MonopolyGame {
    // GameRoom的內容
    // 結構體，用於存儲房間信息
    struct Room {
        uint id; // 房間ID
        address creator; // 房間創建者的地址
        uint maxPlayers; // 房間的最大玩家數量
        string gameMode; // 遊戲模式
        address[] players; // 玩家地址列表
        bytes32 passwordHash; // 使用 bytes32 類型來存儲哈希值
    }

    mapping(address => uint) public addr_to_room_id;  // 玩家address對應到房間id的mapping

    mapping(uint => Room) public rooms; // 房間ID到房間信息的映射
    uint public nextRoomId = 1; // 下一個房間的ID

    // 房間創建事件
    event RoomCreated(uint roomId, address creator, uint maxPlayers, string gameMode);
    // 玩家加入房間事件
    event PlayerJoined(uint roomId, address player);
    // 玩家離開房間事件
    event PlayerLeft(uint roomId, address player);

    // 創建房間
    function createRoom(uint maxPlayers, string memory gameMode, string memory password) public payable returns (uint){
        // 需要支付交易費用1 ETH
        require(msg.value == 1 ether, "Must send 1 ETH to create a room");

        rooms[nextRoomId] = Room({
            id: nextRoomId, // 設置房間ID
            creator: msg.sender, // 設置房間創建者
            maxPlayers: maxPlayers, // 設置房間最大玩家數量
            gameMode: gameMode, // 設置遊戲模式
            passwordHash: keccak256(abi.encodePacked(password)), // 將密碼進行哈希處理並存儲為 bytes32 類型
            players: new address[](0)   // 初始化玩家列表
        }); 

        addr_to_room_id[msg.sender] = nextRoomId;
        
        emit RoomCreated(nextRoomId, msg.sender, maxPlayers, gameMode); // 觸發房間創建事件
        nextRoomId++; // 增加房間ID計數器
        return nextRoomId - 1; // 返回新創建的房間ID
    }

    // 加入房間
    function joinRoom(uint roomId, string memory password) public payable {
        require(msg.value == 1 ether, "Must send 1 ETH to join a room");
        
        Room storage room = rooms[roomId];
        require(room.players.length < room.maxPlayers, "Room is full");

        // 驗證密碼
        require(room.passwordHash == keccak256(abi.encodePacked(password)), "Incorrect password");

        room.players.push(msg.sender);
        emit PlayerJoined(roomId, msg.sender);
    }

    // 離開房間
    function leaveRoom(uint roomId) public {
        Room storage room = rooms[roomId];
        require(room.creator == msg.sender || isPlayerInRoom(roomId, msg.sender), "You are not in this room");

        // 如果是房間創建者離開，則刪除整個房間
        if (room.creator == msg.sender) {
            for (uint i = 0; i < room.players.length; i++) {
                delete addr_to_room_id[room.players[i]];
            }
            delete rooms[roomId];
        } else {
            // 移除玩家地址
            for (uint i = 0; i < room.players.length; i++) {
                if (room.players[i] == msg.sender) {
                    room.players[i] = room.players[room.players.length - 1];
                    room.players.pop();
                    break;
                }
            }
            delete addr_to_room_id[msg.sender];
        }
        emit PlayerLeft(roomId, msg.sender);
    }
    
    // 檢查玩家是否在房間中
    function isPlayerInRoom(uint roomId, address player) internal view returns (bool) {
        // Room storage room = rooms[roomId];
        // for (uint i = 0; i < room.players.length; i++) {
        //     if (room.players[i] == player) {
        //         return true;
        //     }
        // }
        // return false;
        if (addr_to_room_id[player] == roomId){
            return false;
        }else{
            return true;
        }
    }

    // 檢查房間最多玩家人數以及目前玩家人數
    function checkPlayerNumInRoom(uint roomId) public view returns(uint, uint) {
        Room storage room = rooms[roomId];
        return (room.maxPlayers, room.players.length);
    }

    // 獲取房間信息
    function getRoom(uint roomId) public view returns (Room memory) {
        return rooms[roomId];   // start from 1
    }

    // Game的內容
    mapping(address => uint256) public playerPositions;
    // address[4] public players;  // 先設定四個玩家
    uint256 private nonce = 0;

    // 事件
    event DiceRolled(address indexed player, uint256 dice1, uint256 dice2);
    event PlayerMoved(address player, uint256 newPosition);

    // // 初始化玩家
    // function initializePlayers(address[4] memory _players) public {
    //     for (uint i = 0; i < _players.length; i++) {
    //         players[i] = _players[i];
    //         playerPositions[_players[i]] = 0; // 所有玩家起始位置為0
    //     }
    // }

    // 擲骰子，返回兩個1到6之間的數字
    function rollDice() public returns (uint256, uint256) {
        require(isPlayer(msg.sender), "Only a registered player can roll the dice.");
        uint256 dice1 = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce))) % 6 + 1;
        uint256 dice2 = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce + 1))) % 6 + 1;
        nonce += 2;
        emit DiceRolled(msg.sender, dice1, dice2); // 廣播骰子結果
        return (dice1, dice2);
    }

    // 檢查是否為註冊玩家
    function isPlayer(address _address) private view returns (bool) {
        if (addr_to_room_id[_address] != 0){
            return true;
        }else{
            return false;
        }
    }

    // 根據擲骰子的結果移動玩家
    function movePlayer() public {
        (uint256 dice1, uint256 dice2) = rollDice();
        uint256 diceResult = dice1 + dice2;
        playerPositions[msg.sender] = (playerPositions[msg.sender] + diceResult) % 40; // 假設棋盤有40個位置
        emit PlayerMoved(msg.sender, playerPositions[msg.sender]);
    }

    // 退還ETH的函數
    function refund(uint roomId) public {
        Room storage room = rooms[roomId];
        require(room.creator == msg.sender || isPlayerInRoom(roomId, msg.sender), "You are not in this room");
        
        uint refundAmount = 1 ether;
        
        // 確認合約有足夠的餘額可以退還
        require(address(this).balance >= refundAmount, "Insufficient contract balance");

        // 如果是房間創建者退房間，刪除房間並退還ETH給房間創建者和其他玩家
        if (room.creator == msg.sender) {
            for (uint i = 0; i < room.players.length; i++) {
                address player = room.players[i];
                payable(player).transfer(refundAmount);
                delete addr_to_room_id[player];
            }
            delete rooms[roomId];
            payable(room.creator).transfer(refundAmount);
        } else {
            // 其他玩家退還ETH並從房間中移除
            for (uint i = 0; i < room.players.length; i++) {
                if (room.players[i] == msg.sender) {
                    room.players[i] = room.players[room.players.length - 1];
                    room.players.pop();
                    break;
                }
            }
            delete addr_to_room_id[msg.sender];
            payable(msg.sender).transfer(refundAmount);
        }

        emit PlayerLeft(roomId, msg.sender);
}

}
