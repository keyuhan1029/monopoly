// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.0;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC1155, Ownable {
    uint256 public constant TOKEN_COIN = 0; // 代幣 ID：0，用作遊戲貨幣
    uint256 public constant LAND = 1; // 代幣 ID：1，代表土地

    constructor() ERC1155(""){
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
    public
    onlyOwner {
//        require(id == TOKEN_COIN || id == LAND, "Invalid token ID"); // 確保只能發行土地或房屋
        _mint(account, id, amount, "");
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
    public
    onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }
}