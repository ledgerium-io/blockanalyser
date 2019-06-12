const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider("http://125.254.27.14:28545"));
const chalk = require('chalk')

class Ledgerium {
  constructor() {
    this.latestBlock = 0
    this.miner = ''
    this.validators = []
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
            if(!block) return reject("Invalid block")
            if(block.number === 0) reject ("Block not found")
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

}

module.exports = Ledgerium
