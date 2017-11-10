# Readme

### 001_crowdsale

[YouTube Tutorial](https://www.youtube.com/watch?v=ShW2zQcY4LY)

`git clone -b 001_crowdsale git@github.com:rstormsf/ico_per_week.git`

`npm install`

`./node_modules/.bin/truffle compile`

`parity --chain kovan --unlock 0xADDRESS --password FILE_WITH_PASSWORD_IN_PLAINTEXT`

`./node_modules/.bin/truffle migrate`

### Tools Used:

https://github.com/OpenZeppelin/zeppelin-solidity<br>
https://github.com/oraclesorg/oracles-combine-solidity/<br>
https://kovan.etherscan.io/<br>
https://metamask.io/<br>
https://gitter.im/kovan-testnet/faucet - ask for free Kether to deploy to Kovan network<br>
https://parity.io/<br>


### Setting truffle

- you must use nodejs version 9.0
- you must use solc@0.4.18

## Reference and Advice

- http://truffleframework.com/blog/how-were-making-installation-issues-a-thing-of-the-past
- https://ethereum.stackexchange.com/questions/17551/how-to-upgrade-solidity-compiler-in-truffle
- To check path install truffle : "npm config get prefix"
- To stop and run testrcp(you can use shell "runTestRCP.sh" ) to execute each test. 