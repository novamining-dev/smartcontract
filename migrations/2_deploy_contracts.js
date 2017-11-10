var NovatokenCrowdsale = artifacts.require("./NovatokenCrowdsale.sol");

module.exports = function(deployer, network, accounts) {
  return liveDeploy(deployer, accounts);
};

function latestTime() {
  return web3.eth.getBlock('latest').timestamp;
}

const duration = {
  seconds: function(val) { return val},
  minutes: function(val) { return val * this.seconds(60) },
  hours:   function(val) { return val * this.minutes(60) },
  days:    function(val) { return val * this.hours(24) },
  weeks:   function(val) { return val * this.days(7) },
  years:   function(val) { return val * this.days(365)} 
};

async function liveDeploy(deployer, accounts) {
  const BigNumber = web3.BigNumber;
  const RATE = new BigNumber(1);
  const RATE2 = new BigNumber(1);
  const startTime = latestTime() + duration.minutes(10);
  const endTime = startTime + duration.days(30);
  const startTime2 = endTime 
  const endTime2 =  startTime2 + duration.days(30);
/*
  const startTime = latestTime() + duration.minutes(10);
  const endTime =  startTime + duration.days(30);
  */
  console.log([[startTime,startTime2], [endTime,endTime2],[RATE,RATE2], accounts[0]]);
  // uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet) 
  
  return deployer.deploy(NovatokenCrowdsale,[startTime,startTime2], [endTime,endTime2],[RATE,RATE2], accounts[0]).then( async () => {
    const instance = await NovatokenCrowdsale.deployed();
    const token = await instance.token.call();
    console.log('Token Address', token);
  })
}