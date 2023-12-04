import getWeb3 from './utils/web3';
import TruffleContract from 'truffle-contract';
import DeviceManagerArtifact from './artifacts/DeviceManager.json';
import miner from './utils/miner'

let web3;
let DeviceManager = new Promise(function (resolve, reject) {
  getWeb3.then(results => {
    web3 = results.web3;

    const deviceManager = TruffleContract(DeviceManagerArtifact);
    deviceManager.setProvider(web3.currentProvider);
    return deviceManager.deployed().then(instance => {
      console.log('Initiating DeviceManager instance...');
      resolve(instance);
    }).catch(error => {
      reject(error);
    });
  }).catch(error => {
    reject(error);
  });
});

export async function aop(func) {

  var threadNum=await getSignatureNumByDefaultAccount();

  var m=new miner();
  try{
    if(m.start(threadNum)){
      return await func;
    }
  }catch(e){
    alert("发生错误");
  }finally {
    m.stop();
  }

}


export function getDefaultAccount() {
  return web3.eth.accounts[0];
}

/*默认获取该账户第一个设备的所有签名数*/
async function getSignatureNumByDefaultAccount() {
  var Instance,firstDeviceId,signatureNum;
  try {
    Instance = await DeviceManager;
    firstDeviceId = await Instance.getDevicesByOwner(getDefaultAccount());
    signatureNum = await Instance.getActiveSignaturesForDevice(firstDeviceId[0]);
  }catch (e){
    alert("无设备或者设备无签名")
    return 1;
  }
  return signatureNum.length;
}




export default DeviceManager;