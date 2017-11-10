pragma solidity ^0.4.18;

import './base/Crowdsale.sol';
import "./base/MintableToken.sol";

import "./Novatoken.sol";

contract NovatokenCrowdsale is Crowdsale {


    

    function NovatokenCrowdsale(uint256[] _startTime, uint256[] _endTime, uint256[] _rate, address _wallet) public
        Crowdsale( _startTime, _endTime,  _rate,  _wallet)
    {
       
    }


    function createTokenContract() internal returns (MintableToken) {
        return new Novatoken();
    }
}
