pragma solidity ^0.4.18;

import './MintableToken.sol';
import './SafeMath.sol';

/**
 * @title Crowdsale
 * @dev Crowdsale is a base contract for managing a token crowdsale.
 * Crowdsales have a start and end timestamps, where investors can make
 * token purchases and the crowdsale will assign them tokens based
 * on a token per ETH rate. Funds collected are forwarded to a wallet
 * as they arrive.
 */
contract Crowdsale {
  using SafeMath for uint256;

  // The token being sold
  MintableToken public token;

  // start and end timestamps where investments are allowed (both inclusive) for stage
  uint256[] public startTime;
  uint256[] public endTime;

  // address where funds are collected
  address public wallet;

  // how many token units a buyer gets per wei
  //uint256 public rate;

  // how many token units a buyer gets per wei for stage
  uint256[] public rate;

  // amount of raised money in wei
  uint256 public weiRaised;

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

/*
  function Crowdsale(uint256[] _startTime, uint256[] _endTime, uint256[] _rate, address _wallet) {
    require(_wallet != address(0));
    validateRate(_startTime, _endTime, _rate);
    token = createTokenContract();
    startTime = _startTime;
    endTime = _endTime;
    rate = _rate;
    wallet = _wallet;
  }
*/

  function Crowdsale(uint256[] _startTime, uint256[] _endTime, uint256[] _rate, address _wallet) public {
    require(_wallet != address(0));
    validateRate(_startTime, _endTime, _rate);
    token = createTokenContract();
    startTime = _startTime;
    endTime = _endTime;
    rate = _rate;
    wallet = _wallet;
  }



  function validateRate(uint256[] _startTime, uint256[] _endTime, uint256[] _rate) view private {
    require(_startTime.length > 0);
    uint8 length = uint8(_startTime.length);
    require(length == _endTime.length);
    require(length == _rate.length);
    uint8 i;
    for ( i = 0; i < length - 1; i++ ) {
       require(_startTime[i] >= now);
       require(_startTime[i+1] > _startTime[i]);
       require(_endTime[i+1] > _endTime[i]);
       require(_endTime[i] == _startTime[i+1]);
    }
    for ( i = 0; i < length; i++) {
        require(_endTime[i] >= _startTime[i]);
        require(_rate[i] > 0);
    }
    
  }

  // creates the token to be sold.
  // override this method to have crowdsale of a specific mintable token.
  function createTokenContract() internal returns (MintableToken) {
    return new MintableToken();
  }

  function getRateStage()  internal constant returns (uint256) {
    uint8 length = uint8(startTime.length);
     for ( uint8 i = 0; i < length; i++ ) {
       if ( startTime[i] <= now && endTime[i] > now) {
         return rate[i];
       }
     }
     return 0;

  }


  // fallback function can be used to buy tokens
  function () public payable {
    buyTokens(msg.sender);
  }

  // low level token purchase function
  function buyTokens(address beneficiary) public payable {
    require(beneficiary != address(0));
    require(validPurchase());
    uint256 _rate = getRateStage(); 
    require(_rate > 0);

    uint256 weiAmount = msg.value;

    // calculate token amount to be created
    uint256 tokens = weiAmount.mul(_rate);

    // update state
    weiRaised = weiRaised.add(weiAmount);

    token.mint(beneficiary, tokens);
    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

    forwardFunds();
  }

  // send ether to the fund collection wallet
  // override to create custom fund forwarding mechanisms
  function forwardFunds() internal {
    wallet.transfer(msg.value);
  }

  // @return true if the transaction can buy tokens
  function validPurchase() internal constant returns (bool) {
    bool nonZeroPurchase = msg.value != 0;
    return nonZeroPurchase;
  }

  // @return true if crowdsale event has ended
  function hasEnded() public constant returns (bool) {
    uint8 length = uint8(endTime.length);
    return now > endTime[length - 1];
    //return true;
  }


}
