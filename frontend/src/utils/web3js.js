


let getWeb3j=new Promise(function (resolve, reject){
    let results
    window.addEventListener("load",function (){
        const Web3 = require('web3');
        let web3 = new Web3();
        web3.setProvider(new web3.providers.HttpProvider('http://127.0.0.1:8541'));
        results = {
            web3: web3
        };
        if (web3.isConnected()) {
            resolve(results);
        } else {
            reject(results);
        }
    })
})

export default getWeb3j

