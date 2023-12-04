

export default function miner(){
    const Web3 = require('web3')
    var web3 = new Web3()
    const web3Admin = require('web3admin')
    web3.setProvider(new web3.providers.HttpProvider('http://127.0.0.1:8545'))
    web3Admin.extend(web3)

    this.start=function(ThreadNum){
        if(!web3.eth.mining){
            web3.miner.start(ThreadNum);
        }
        return true;
    }

    this.stop=function (){
        if(web3.eth.mining){
            web3.miner.stop();
        }
        return true;
    }
}

