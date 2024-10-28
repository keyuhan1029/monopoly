// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 引入 OpenZeppelin 的 ERC1155 和 Ownable 合約
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// 定義一個名為 BigRichManGame 的合約，繼承自 ERC1155 和 Ownable
contract BigRichManGame is ERC1155, Ownable {
    uint256 public constant TOKEN_COIN = 0; // 代幣 ID：0，用作遊戲貨幣
    uint256 public constant LAND = 1; // 代幣 ID：1，代表土地
    uint256 public constant HOUSE = 2; // 代幣 ID：2，代表房屋

    // 私有變量，用於追踪下一個房子的 ID
    uint256 private _nextHouseId = 100;

    // 映射，用於儲存每棟房屋的 metadata URL
    mapping(uint256 => string) private _houseMetadataUrls;

    // 合約構造函數，設置基礎 metadata 的 URL 模板
    constructor() ERC1155("https://game.example.com/api/item/{id}.json") {
        _mint(msg.sender, TOKEN_COIN, 10000, ""); // 初始化，給部署者發行10000遊戲貨幣
    }

    // 發行土地或房屋
    function mint(
        address account,
        uint256 id,
        uint256 amount
    ) public onlyOwner {
        require(id == LAND || id == HOUSE, "Invalid token ID"); // 確保只能發行土地或房屋
        _mint(account, id, amount, "");
    }

    // 發行遊戲貨幣
    function mintCurrency(address account, uint256 amount) public onlyOwner {
        _mint(account, TOKEN_COIN, amount, ""); // 發行指定數量的遊戲貨幣給指定賬戶
    }

    // 轉移代幣
    function transferToken(address to, uint256 id, uint256 amount) public {
        safeTransferFrom(msg.sender, to, id, amount, ""); // 由代幣擁有者發起轉移
    }

    // 發行新房屋
    function mintHouse(
        address account,
        string memory metadataUrl
    ) public onlyOwner {
        uint256 currentHouseId = _nextHouseId++; // 獲得新房屋 ID 並自增以用於下一棟房屋
        _mint(account, currentHouseId, 1, ""); // 發行一棟房屋
        _houseMetadataUrls[currentHouseId] = metadataUrl; // 設置房屋的 metadata URL
    }

    // 獲取房屋的 metadata
    function getHouseMetadata(
        uint256 houseId
    ) public view returns (string memory) {
        require(
            bytes(_houseMetadataUrls[houseId]).length != 0,
            "House does not exist."
        ); // 確保房屋存在
        return _houseMetadataUrls[houseId]; // 返回房屋的 metadata URL
    }
}
