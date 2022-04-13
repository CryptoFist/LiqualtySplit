// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;
import "hardhat/console.sol";
import "./interfaces/ILiqualitySplit.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LiqualitySplit is ReentrancyGuardUpgradeable, OwnableUpgradeable, ILiqualitySplit {
   IERC20 private token;
   mapping(address => UserInfo) private userInfos;
   address[] private userList;
   uint256 private totalAmount;

   function initialize(address tokenAddress_) public initializer {
      __Ownable_init();
      token = IERC20(tokenAddress_);
   }

   function checkAddress(address sender_) internal pure {
      require (sender_ != address(0), 'zero address');
   }

   function addShare(uint256 amount_) external payable nonReentrant override {
      address sender = _msgSender();
      checkAddress(sender);
      require (token.allowance(sender, address(this)) >= amount_, 'not approved');

      if (userInfos[sender].shareAmount == 0) {
         userList.push(sender);
      }
      userInfos[sender].shareAmount += amount_;
      totalAmount += amount_;

      require (token.transferFrom(sender, address(this), amount_), 'transaction failed');

      emit AddShare(sender, amount_);
   }

   function setStreamingTime(uint256 time_) external override {
      address sender = _msgSender();
      checkAddress(sender);
      require (userInfos[sender].shareAmount > 0, 'no shareAmount');
      require (userInfos[sender].streamingTime == 0, 'already set');
      require (time_ >= 2592000 && time_ <= 30 days, 'incorrect time');

      userInfos[sender].streamingTime = time_;
      userInfos[sender].lastClaimedTime = block.timestamp;

      emit SetStreamingTime(sender, time_);
   }

   function withDraw() external nonReentrant override {
      address sender = _msgSender();
      checkAddress(sender);

      UserInfo memory info = userInfos[sender];
      uint256 curTime = block.timestamp;
      require (info.shareAmount > 0, 'not shareAmount');

      uint256 withdrawableAmount = info.withdrawableAmount;

      if (info.streamingTime > 0) {
         withdrawableAmount = withdrawableAmount * (curTime - info.lastClaimedTime) / info.streamingTime ;
         userInfos[sender].lastClaimedTime = curTime;
      }

      userInfos[sender].withdrawableAmount -= withdrawableAmount;

      if (withdrawableAmount > 0) {
         payable(sender).transfer(withdrawableAmount);
      }
   }

   function depositeETH() external payable onlyOwner override { 
      for (uint256 i = 0; i < userList.length; i ++) {
         userInfos[userList[i]].withdrawableAmount += msg.value * userInfos[userList[i]].shareAmount / totalAmount;
      }
   }

   receive() external payable { }
   
}