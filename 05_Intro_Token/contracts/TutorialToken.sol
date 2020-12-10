pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract TutorialToken is ERC20 {
    string public name = "TutorialToken";
    string public symbol = "TTT";
    uint8 public decimals = 6;
    uint public INITIAL_SUPPLY = 1200000;

    constructor() public {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}