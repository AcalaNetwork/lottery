// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AcalaPoint is ERC20, ERC20Burnable, Ownable {
    mapping(address => bool) public whitelistedMinters;

    constructor(address initialOwner) ERC20("Acala Point", "AP") Ownable(initialOwner) {}

    function whitelistMinter(address _minter) external onlyOwner {
        whitelistedMinters[_minter] = true;
    }

    function removeWhitelistMinter(address _minter) external onlyOwner {
        whitelistedMinters[_minter] = false;
    }

    function mint(address _to, uint256 _amount) external {
        require(whitelistedMinters[msg.sender], "<mint> not a whitelisted minter");
        _mint(_to, _amount);
    }

    function mintBatch(address[] calldata _addresses, uint256[] calldata _amounts) external {
        require(whitelistedMinters[msg.sender], "<mintBatch> not a whitelisted minter");
        require(_addresses.length == _amounts.length, "<mintBatch> array lengths mismatch");

        for (uint256 i = 0; i < _addresses.length; i++) {
            _mint(_addresses[i], _amounts[i]);
        }
    }
}
