// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BigRichManGame is ERC1155, Ownable {
    uint256 public constant TOKEN_GOLD = 0; // 代表金幣的代幣ID
    uint256 public constant TOKEN_SILVER = 1; // 代表銀幣的代幣ID
    uint256 public constant LAND = 2; // 土地
    uint256 public constant HOUSE = 3; // 房屋

    // 用于追踪下一个房子ID的变量
    uint256 private _nextHouseId = 100; // 假设从100开始，避免与货币ID冲突

    // map to the URLs storing the information of houses
    mapping(uint256 => string) private _houseMetadataUrls;

    constructor() ERC1155("https://game.example.com/api/item/{id}.json") {
        _mint(msg.sender, TOKEN_GOLD, 10000, "");
        _mint(msg.sender, TOKEN_SILVER, 10000, "");
    }

    function mint(address account, uint256 id, uint256 amount) public onlyOwner {
        require(id == LAND || id == HOUSE, "Invalid token ID");
        _mint(account, id, amount, "");
    }

    function mintCurrency(address account, uint256 amount, bool isGold) public onlyOwner {
        if (isGold) {
            _mint(account, TOKEN_GOLD, amount, "");
        } else {
            _mint(account, TOKEN_SILVER, amount, "");
        }
    }

    function transferToken(address to, uint256 id, uint256 amount) public {
        safeTransferFrom(msg.sender, to, id, amount, "");
    }

    function mintHouse(address account, string memory metadataUrl) public onlyOwner {
        uint256 currentHouseId = _nextHouseId++;
        _mint(account, currentHouseId, 1, "");
        _houseMetadataUrls[currentHouseId] = metadataUrl;
    }

    function getHouseMetadata(uint256 houseId) public view returns (string memory) {
        require(bytes(_houseMetadataUrls[houseId]).length != 0, "House does not exist.");
        return _houseMetadataUrls[houseId];
    }

}