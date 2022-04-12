// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "../interfaces/ILiqualitySplit.sol";

library LiqualitySplitLibrary {
   function _calcWithdrawableAmount(
      uint256 totalAmount_,
      uint256 poolAmount_,
      ILiqualitySplit.UserInfo memory userInfo_
   ) internal pure returns(uint256 amount) {
      amount = poolAmount_ * userInfo_.shareAmount / totalAmount_;
      if (userInfo_.streamingTime > 0) {
         amount /= userInfo_.streamingTime;
      }
   }
}