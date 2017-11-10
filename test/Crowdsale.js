const Ether = require('../helpers/ether');
const AdvanceToBlock = require('../helpers/advanceToBlock')
//import AdvanceToBlock from '../helpers/advanceToBlock'
//import {increaseTimeTo, duration} from '../helpers/increaseTime'

const IncreaseTime = require( '../helpers/increaseTime')
const LatestTime = require( '../helpers/latestTime')
const EVMThrow = require('../helpers/EVMThrow')



const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const Crowdsale = artifacts.require('../contracts/base/Crowdsale')
const MintableToken = artifacts.require('../contracts/base/MintableToken')

contract('Crowdsale', function ([_, investor, wallet, purchaser]) {

  const rate = new BigNumber(1000)
  const value = Ether.ether(42)


  const expectedTokenAmount = rate.mul(value)

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await AdvanceToBlock.advanceBlock()
  })

  beforeEach(async function () {
    this.startTime = LatestTime.latestTime() + IncreaseTime.duration.weeks(1);
    this.endTime =   this.startTime + IncreaseTime.duration.weeks(1);
    this.startTime2 =   this.endTime 
    this.endTime2 =   this.startTime2 + IncreaseTime.duration.weeks(1);
    this.afterEndTime = this.endTime2 + IncreaseTime.duration.seconds(1)

    //this.afterEndTimeStg1 = this.endTime1 + IncreaseTime.duration.seconds(1)
    this.listStartTime=[this.startTime,this.startTime2  ];
    this.listEndTime=[this.endTime,this.endTime2  ];
    this.listRate=[rate,rate];
    //this.listAfterEndTime=[this.afterEndTimeStg1,this.afterEndTime];

    this.crowdsale = await Crowdsale.new(this.listStartTime, this.listEndTime, this.listRate, wallet)
    this.token = MintableToken.at(await this.crowdsale.token())
    
  })
  

  it('should be token owner', async function () {
    const owner = await this.token.owner()
    owner.should.equal(this.crowdsale.address)
  })

  it('should be ended only after end', async function () {
    let ended = await this.crowdsale.hasEnded()
    ended.should.equal(false)
    await IncreaseTime.increaseTimeTo(this.afterEndTime)
    ended = await this.crowdsale.hasEnded()
    ended.should.equal(true)
  })
   

  describe('accepting payments', function () {

    it('should reject payments before start', async function () {
      await this.crowdsale.send(value).should.be.rejectedWith(EVMThrow.eVMThrow)
      await this.crowdsale.buyTokens(investor, {from: purchaser, value: value}).should.be.rejectedWith(EVMThrow.eVMThrow)
    })


    it('should accept payments after start(stages)', async function () {
      for(let i =0; i < this.listStartTime.length;i++ )
      {
        await IncreaseTime.increaseTimeTo(this.listStartTime[i])
        await this.crowdsale.send(value).should.be.fulfilled
        await this.crowdsale.buyTokens(investor, {value: value, from: purchaser}).should.be.fulfilled

      }

      /*
      await IncreaseTime.increaseTimeTo(this.startTime)
      await this.crowdsale.send(value).should.be.fulfilled
      await this.crowdsale.buyTokens(investor, {value: value, from: purchaser}).should.be.fulfilled
      */
    })



    it('should accept payments after end(n-1 stages )', async function () {
      for(let i =0; i < this.listEndTime.length-1;i++ )
      {
        let afterEndTime = this.listEndTime[i] + IncreaseTime.duration.seconds(1)
        await IncreaseTime.increaseTimeTo(afterEndTime)
        await this.crowdsale.send(value).should.be.fulfilled
        await this.crowdsale.buyTokens(investor, {value: value, from: purchaser}).should.be.fulfilled

      }

      /*
      await IncreaseTime.increaseTimeTo(this.startTime)
      await this.crowdsale.send(value).should.be.fulfilled
      await this.crowdsale.buyTokens(investor, {value: value, from: purchaser}).should.be.fulfilled
      */
    })


    it('should reject payments after end', async function () {
      await IncreaseTime.increaseTimeTo(this.afterEndTime)
      await this.crowdsale.send(value).should.be.rejectedWith(EVMThrow.eVMThrow)
      await this.crowdsale.buyTokens(investor, {value: value, from: purchaser}).should.be.rejectedWith(EVMThrow.eVMThrow)
    })
   

  })


 
  describe('high-level purchase', function () {

    beforeEach(async function() {
      await IncreaseTime.increaseTimeTo(this.startTime)
    })

    it('should log purchase', async function () {
      const {logs} = await this.crowdsale.sendTransaction({value: value, from: investor})

      const event = logs.find(e => e.event === 'TokenPurchase')

      should.exist(event)
      event.args.purchaser.should.equal(investor)
      event.args.beneficiary.should.equal(investor)
      event.args.value.should.be.bignumber.equal(value)
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount)
    })

    it('should increase totalSupply', async function () {
      await this.crowdsale.send(value)
      const totalSupply = await this.token.totalSupply()
      totalSupply.should.be.bignumber.equal(expectedTokenAmount)
    })

    it('should assign tokens to sender', async function () {
      await this.crowdsale.sendTransaction({value: value, from: investor})
      let balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount)
    })

    it('should forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(wallet)
      await this.crowdsale.sendTransaction({value, from: investor})
      const post = web3.eth.getBalance(wallet)
      post.minus(pre).should.be.bignumber.equal(value)
    })

  })

   
  describe('low-level purchase', function () {

    beforeEach(async function() {
      await IncreaseTime.increaseTimeTo(this.startTime)
    })

    it('should log purchase', async function () {
      const {logs} = await this.crowdsale.buyTokens(investor, {value: value, from: purchaser})

      const event = logs.find(e => e.event === 'TokenPurchase')

      should.exist(event)
      event.args.purchaser.should.equal(purchaser)
      event.args.beneficiary.should.equal(investor)
      event.args.value.should.be.bignumber.equal(value)
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount)
    })

    it('should increase totalSupply', async function () {
      await this.crowdsale.buyTokens(investor, {value, from: purchaser})
      const totalSupply = await this.token.totalSupply()
      totalSupply.should.be.bignumber.equal(expectedTokenAmount)
    })

    it('should assign tokens to beneficiary', async function () {
      await this.crowdsale.buyTokens(investor, {value, from: purchaser})
      const balance = await this.token.balanceOf(investor)
      balance.should.be.bignumber.equal(expectedTokenAmount)
    })

    it('should forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(wallet)
      await this.crowdsale.buyTokens(investor, {value, from: purchaser})
      const post = web3.eth.getBalance(wallet)
      post.minus(pre).should.be.bignumber.equal(value)
    })

  })
   

})
