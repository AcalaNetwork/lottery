// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Lottery is Ownable {
    ERC20Burnable public apToken;
    IERC20 public acaToken;

    uint256 public endTime;
    uint256 public duration = 1 days;
    uint256 public entryFee = 10 ether; // Assuming AP tokens have 18 decimals
    uint256 public totalTicketsCount = 0;

    constructor(address _apTokenAddress, address _acaTokenAddress, address initialOwner) 
        Ownable(initialOwner) {
        apToken = ERC20Burnable(_apTokenAddress);
        acaToken = IERC20(_acaTokenAddress);
    }

    function isLotteryOpen() public view returns (bool) {
        bool isTimePast = block.timestamp >= endTime;
        bool isTicketAvailable = totalTicketsCount < 350;

        return !isTimePast || isTicketAvailable;
    }

    function drawLottery(uint256 _ticketCount) external {
        require(isLotteryOpen(), "<drawlottery> lottery is closed");
        totalTicketsCount += _ticketCount;

        uint256 totalEntryFee = entryFee * _ticketCount;
        apToken.burnFrom(msg.sender, totalEntryFee);

        uint256 totalReward = 0;
        for (uint256 i = 0; i < _ticketCount; i++) {
            totalReward += randReward();
        }
        require(totalReward <= acaToken.balanceOf(address(this)), "<drawlottery> not enough ACA for reward");
        require(acaToken.transfer(msg.sender, totalReward), "<drawlottery> transfer failed");
    }


    function randReward() private view returns (uint256) {
        uint256 rand = randNumber(1, 10000);
        if (rand <= 7000) { // 70%
            return randNumber(10, 20) * 1 ether;
        } else if (rand <= 9000) { // 20%
            return randNumber(21, 30) * 1 ether;
        } else if (rand <= 9800) { // 8%
            return randNumber(31, 50) * 1 ether;
        } else if (rand <= 9900) { // 1%
            return randNumber(51, 100) * 1 ether;
        } else if (rand <= 9950) { // 0.5%
            return randNumber(101, 200) * 1 ether;
        } else if (rand <= 9975) { // 0.25%
            return randNumber(201, 300) * 1 ether;
        } else { // 0.25%
            return randNumber(301, 500) * 1 ether;
        }
    }

    function randNumber(uint256 min, uint256 max) private view returns (uint256) {
        uint256 rand256 = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp)));
        return min + (rand256 % (max - min + 1));
    }

    function startLottery() external onlyOwner {
        endTime = block.timestamp + duration;
    }

    function setduration(uint256 _duration) external onlyOwner {
        duration = _duration;
    }

    function setEntryFee(uint256 _entryFee) external onlyOwner {
        entryFee = _entryFee;
    }

    function depositACA(uint256 amount) external {
        require(amount > 0, "<depositaca> amount must be greater than 0");
        require(acaToken.transferFrom(msg.sender, address(this), amount), "<depositaca> transfer failed");
    }

    function withdrawACA() external onlyOwner {
        uint256 acaBalance = acaToken.balanceOf(address(this));
        require(acaBalance > 0, "<withdrawaca> no aca to withdraw");
        acaToken.transfer(msg.sender, acaBalance);
    }
}
