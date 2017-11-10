pragma solidity ^0.4.18;

import "./base/MintableToken.sol";

contract Novatoken is MintableToken {
    string public constant name = "Novatoken";
    string public constant symbol = "NTK";
    uint8 public constant decimals = 8;
}
