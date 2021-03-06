// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
  uint256 constant INITIAL_SUPPLY = 1000000 * 1e18;

  constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {
    _mint(msg.sender, INITIAL_SUPPLY);
  }
}
