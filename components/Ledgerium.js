const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://125.254.27.14:28545'));
const chalk = require('chalk')
const request = require('request');
const querystring = require('querystring');

class Ledgerium {
  constructor() {
    this.latestBlock = 0
    this.miner = ''
    // this.validators = []
    this.oldBlock;
    this.diff = 10;
    this.count = 0;
    this.balances = {};
  }

  getNewStats() {
    
    web3.eth.getBlockNumber()
      .then((blockNumber) => {
        console.log(blockNumber)

        this.getValidatorBalances(blockNumber)
        this.getMinerBalance(blockNumber)
        
        //Store block number for the first time
        if ( this.count === 0 ) {
          this.count = 1;          
          this.oldBlock = blockNumber;
        } else {
          //If difference is 10, print balances
          if(blockNumber === this.oldBlock+this.diff){
            this.oldBlock = blockNumber;
            console.log('---', this.balances)
            //Empty after 10 blocks
            this.balances = {} 
          }
        }
      })
  }

  getValidatorBalances(blockNumber) {
    return new Promise ((resolve, reject) => {

      this.getValidators()
      .then((validators) => {
        for(let i=0; i<validators.length; i++) {
          web3.eth.getBalance(validators[i])
          .then(balance => {
            let validator = 'validator_' + validators[i];
            if(this.balances[validator] == undefined) this.balances[validator] = {};
            this.balances[validator][blockNumber] = web3.utils.fromWei(balance, 'ether') + ' XLG';
          })
        }
        resolve();            
      })
    })
  }

  getMinerBalance(blockNumber) {
    return new Promise ((resolve, reject) => {
      web3.eth.getBlock(blockNumber)
          .then(block => {
            if(!block) return reject('Invalid block')
            if(block.number === 0) reject ('Block not found')
            this.miner = block.miner
            web3.eth.getBalance(block.miner)
              .then(minerBalance => {
                let miner = 'miner_' + block.miner;
                if(this.balances[miner] == undefined) this.balances[miner] = {};
                this.balances[miner][blockNumber] = web3.utils.fromWei(minerBalance, 'ether') + ' XLG';
              })
            resolve()
          })
          .catch(error => {
            reject(error)
          })
    })
  }


  getStats() {
    this.getBlock()
      .then(block => {
        let validators = []
        console.log(`${chalk.cyan('Block Height:')} ${block.number}`)
        web3.eth.getBalance(block.miner)
          .then(minerBalance => {
            console.log(`${chalk.red('Miner Address:')} ${block.miner} \t ${chalk.red('Balance:')} ${web3.utils.fromWei(minerBalance, 'ether')} XLG`)
          })
        for(let i=0; i<block.validators.length; i++) {
          web3.eth.getBalance(block.validators[i])
            .then(balance => {
              console.log(`${chalk.cyan('Validator:')} ${block.validators[i]} \t${chalk.cyan('Balance:')} ${web3.utils.fromWei(balance, 'ether')} XLG`)
            })
        }
      })
      .catch(console.log)
  }



  getBlock() {
      return new Promise((resolve, reject) => {
        web3.eth.getBlock('latest')
          .then(block => {
            if(!block) return reject('Invalid block')
            if(block.number === 0) reject ('Block not found')
            this.latestBlock = block.number
            this.miner = block.miner
            this.validators = block.validators
            resolve({
              number: block.number,
              miner: block.miner,
              validators: block.validators
            })
          })
          .catch(error => {
            reject(error)
          })
      })
  }

  getValidators() {
    return new Promise ((resolve, reject) => {
      
      request({
        url: 'http://125.254.27.14:28545/',
        method: 'POST',
        json: { 
          jsonrpc: '2.0', 
          method: 'istanbul_getValidators', 
          params: [], 
          id: new Date().getTime()
        },
      }, (err, res) => {
        if(err) {
          console.log('Error in getValidators', err)
        } else {
          resolve(res.body.result);
        }
      })
    })
  }

}

module.exports = Ledgerium
