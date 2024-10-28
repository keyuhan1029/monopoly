npm// pragma solidity ^0.8.0;

// contract GameRoom {
//     // 結構體，用於存儲房間信息
//     struct Room {
//         uint id; // 房間ID
//         address creator; // 房間創建者的地址
//         uint maxPlayers; // 房間的最大玩家數量
//         string gameMode; // 遊戲模式
//         address[] players; // 玩家地址列表
//         bytes32 passwordHash; // 使用 bytes32 類型來存儲哈希值
//     }

//     mapping(uint => Room) public rooms; // 房間ID到房間信息的映射
//     uint public nextRoomId; // 下一個房間的ID

//     // 房間創建事件
//     event RoomCreated(uint roomId, address creator, uint maxPlayers, string gameMode);
//     // 玩家加入房間事件
//     event PlayerJoined(uint roomId, address player);
//     // 玩家離開房間事件
//     event PlayerLeft(uint roomId, address player);

//     // 創建房間
//     function createRoom(uint maxPlayers, string memory gameMode, string memory password) public payable returns (uint){
//         require(msg.value == 1 ether, "Must send 1 ETH to create a room");

//         rooms[nextRoomId] = Room({
//             id: nextRoomId, // 設置房間ID
//             creator: msg.sender, // 設置房間創建者
//             maxPlayers: maxPlayers, // 設置房間最大玩家數量
//             gameMode: gameMode, // 設置遊戲模式
//             passwordHash: keccak256(abi.encodePacked(password)), // 將密碼進行哈希處理並存儲為 bytes32 類型
//             players: new address[](0)   // 初始化玩家列表
//         }); 
        
//         emit RoomCreated(nextRoomId, msg.sender, maxPlayers, gameMode); // 觸發房間創建事件
//         nextRoomId++; // 增加房間ID計數器
//         return nextRoomId - 1; // 返回新創建的房間ID
//     }

//     // 加入房間
//     function joinRoom(uint roomId, string memory password) public payable {
//         require(msg.value == 1 ether, "Must send 1 ETH to create a room");
        
//         Room storage room = rooms[roomId];
//         require(room.players.length < room.maxPlayers, "Room is full");

//         // 驗證密碼
//         require(room.passwordHash == keccak256(abi.encodePacked(password)), "Incorrect password");

//         room.players.push(msg.sender);
//         emit PlayerJoined(roomId, msg.sender);
//     }

//     // 離開房間
//     function leaveRoom(uint roomId) public {
//         Room storage room = rooms[roomId];
//         require(room.creator == msg.sender || isPlayerInRoom(roomId, msg.sender), "You are not in this room");

//         // 如果是房間創建者離開，則刪除整個房間
//         if (room.creator == msg.sender) {
//             delete rooms[roomId];
//         } else {
//             // 移除玩家地址
//             for (uint i = 0; i < room.players.length; i++) {
//                 if (room.players[i] == msg.sender) {
//                     room.players[i] = room.players[room.players.length - 1];
//                     room.players.pop();
//                     break;
//                 }
//             }
//         }
//         emit PlayerLeft(roomId, msg.sender);
//     }
    
//     // 檢查玩家是否在房間中
//     function isPlayerInRoom(uint roomId, address player) internal view returns (bool) {
//         Room storage room = rooms[roomId];
//         for (uint i = 0; i < room.players.length; i++) {
//             if (room.players[i] == player) {
//                 return true;
//             }
//         }
//         return false;
//     }

//     // 獲取房間信息
//     function getRoom(uint roomId) public view returns (Room memory) {
//         return rooms[roomId];
//     }
// }
