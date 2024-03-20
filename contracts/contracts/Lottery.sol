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
    uint256 public entryFee = 10 ether;
    uint256 public maxTicketsCount = 350;
    uint256 public ticketsSold = 0;
    uint256 private nonce = 0;

    event LotteryDraw(
        address indexed player,
        uint256 ticketCount,
        uint256 totalRewardAca,
        uint256[] rewardsComposition
    );

    constructor(address _apTokenAddress, address _acaTokenAddress, address _initialOwner)
        Ownable(_initialOwner) {
        apToken = ERC20Burnable(_apTokenAddress);
        acaToken = IERC20(_acaTokenAddress);
    }

    function startLottery() external onlyOwner {
        endTime = block.timestamp + duration;
        ticketsSold = 0;
    }

    function isOpen() public view returns (bool) {
        bool isTimePast = block.timestamp >= endTime;
        bool isTicketAvailable = ticketsSold < maxTicketsCount;

        return !isTimePast && isTicketAvailable;
    }

    function timeRemaining() public view returns (uint256) {
        if (block.timestamp >= endTime) {
            return 0;
        } else {
            return endTime - block.timestamp;
        }
    }

    function ticketRemaining() public view returns (uint256) {
        if (ticketsSold >= maxTicketsCount) {
            return 0;
        } else {
            return maxTicketsCount - ticketsSold;
        }
    }

    function drawLottery(uint256 _ticketCount) external {
        require(isOpen(), "<drawlottery> lottery is closed");
        ticketsSold += _ticketCount;
        require(ticketsSold <= maxTicketsCount, "<drawlottery> not enough tickets left");

        uint256 totalEntryFee = entryFee * _ticketCount;
        require(apToken.balanceOf(msg.sender) >= totalEntryFee, "<drawlottery> insufficient AP balance");
        require(apToken.allowance(msg.sender, address(this)) >= totalEntryFee, "<drawlottery> insufficient AP allowance");

        apToken.burnFrom(msg.sender, totalEntryFee);

        uint256 totalReward = 0;
        uint256[] memory rewardsComposition = new uint256[](_ticketCount);
        for (uint256 i = 0; i < _ticketCount; i++) {
            uint256 reward = randRewardAmount();
            totalReward += reward;
            rewardsComposition[i] = reward;
        }

        uint256 totalRewardAca = totalReward * 10**12;
        require(totalRewardAca <= acaToken.balanceOf(address(this)), "<drawlottery> not enough ACA for reward");
        require(acaToken.transfer(msg.sender, totalRewardAca), "<drawlottery> transfer failed");

        emit LotteryDraw(msg.sender, _ticketCount, totalRewardAca, rewardsComposition);
    }

    function randRewardAmount() private returns (uint256) {
        uint256 rand = randNumber(1, 10000);
        if (rand <= 7000) {         // 70%
            return randNumber(10, 20);
        } else if (rand <= 9000) {  // 20%
            return randNumber(21, 30);
        } else if (rand <= 9800) {  // 8%
            return randNumber(31, 50);
        } else if (rand <= 9900) {  // 1%
            return randNumber(51, 100);
        } else if (rand <= 9950) {  // 0.5%
            return randNumber(101, 200);
        } else if (rand <= 9975) {  // 0.25%
            return randNumber(201, 300);
        } else {                    // 0.25%
            return randNumber(301, 500);
        }
    }

    function randNumber(uint256 min, uint256 max) private returns (uint256) {
        nonce++; // Ensure a different value for each call within the same block
        uint256 rand256 = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp, nonce)));
        return min + (rand256 % (max - min + 1));
    }

    function setduration(uint256 _duration) external onlyOwner {
        duration = _duration;
    }

    function setEntryFee(uint256 _entryFee) external onlyOwner {
        entryFee = _entryFee;
    }

    function setMaxTicketsCount(uint256 _maxTicketsCount) external onlyOwner {
        maxTicketsCount = _maxTicketsCount;
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

    receive() external payable {}
    fallback() external payable {}
}
