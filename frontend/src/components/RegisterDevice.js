// import DeviceManager, { getDefaultAccount } from '../DeviceManager';

import elliptic from 'elliptic';
import ethWallet from 'ethereumjs-wallet';
import { sha3, addHexPrefix, setLengthLeft } from 'ethereumjs-util';
import { merkleRoot } from 'merkle-tree-solidity';
import React, { Component } from 'react';
import './RegisterDevice.css';
import keyth from "../utils/keyth";

import {
  Steps,
  Button,
  Input,
  Card,
  Spin,
  Alert,
  Divider,
  Form,
  Icon,
  Dropdown,
  Menu,
  message,
  notification,
  Select
} from 'antd';

import getWeb3j from "../utils/web3js";
const { Option } = Select;
const Step = Steps.Step;
const { Meta } = Card;
const EC = elliptic.ec;
const FormItem = Form.Item;

const steps = [{
  title: 'Metadata',
}, {
  title: 'Firmware',
}, {
  title: 'Confirm',
}];

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message,
    description
  });
};

class RegisterDevice extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState() {
    return {
      pwd:"",
      devices:[],
      loading: false,
      current: 0,
      identifier: '',
      metadataHash: '',
      firmwareHash: '',
      showIdentifierInfo: false,
      publicKey: '',
      privateKey: '',
      address: '',
      metadata: [{ value: '' }],
      firmware: '',
      curve: '',
      deviceId: '',
    };
  }

  reset() {
    this.setState(this.getInitialState());
  }

  async componentWillMount() {
    try {
      //let results = await getWeb3;
      let results=await getWeb3j;

      this.setState({
        web3: results.web3,
        devices:results.web3.eth.accounts
      });
    } catch (error) {
      console.log(error);
      message.error(error.message);
    }
  }

  async watchForChanges() {
    var filter = this.state.web3.eth.filter('latest')
    filter.watch((error, result) => {
      if (!error) {
        openNotificationWithIcon('success', 'Transaction mined', 'Your device has been registered.');
        filter.stopWatching();
      }
      this.setState({
        loading: false
      });
      this.next();
    });

    // let instance = await DeviceManager;
    // let deviceCreatedEvent = instance.DeviceCreated()
    //
    // deviceCreatedEvent.watch((error, result) => {
    //   if (!error) {
    //     if (result.transactionHash === txHash) {
    //       openNotificationWithIcon('success', 'Transaction mined', 'Your device has been registered.');
    //       this.state.deviceCreatedEvent.stopWatching();
    //       this.setState({
    //         loading: false,
    //         deviceId: result.args.deviceId.toNumber()
    //       })
    //       this.next();
    //     }
    //   } else {
    //     console.error(error);
    //   }
    // });
    //
    // this.setState({
    //   deviceCreatedEvent
    // })
  }

  next() {
    const { current, metadataHash, firmwareHash } = this.state;
    console.log(current);
        if ((current === 0) && (metadataHash === null || metadataHash === '')) {
       message.error('Metadata hash不允许为空');
      } else if ((current === 1) && (firmwareHash === null || firmwareHash === '')) {
       message.error('Firmware hash不允许为空');
    } else if (current === 1) {
      const newWallet = ethWallet.generate();
      let publicKey = newWallet.getPublicKey().toString('hex');
      let privateKey = newWallet.getPrivateKey().toString('hex');
      let address = newWallet.getAddressString();
      this.setState(prevState => ({
        current: prevState.current + 1,
        publicKey: publicKey,
        privateKey: privateKey,
        identifier: address,
        address: address
      }));
    } else {
        this.setState(prevState => ({current: prevState.current + 1}));
    }
  }
  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  gotoStep(i) {
    this.setState({ current: i });
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });

    if (this.state.current === 0) {
      this.setState({
        showIdentifierInfo: false
      });
    }

    if (this.state.current === 0 && e.target.name === 'identifier') {
      this.setState({
        showIdentifierInfo: false,
        publicKey: '',
        privateKey: '',
        address: '',
        curve: ''
      });
    }

    if (this.state.current === 1 && e.target.name === 'metadataHash') {
      this.setState({
        metadata: [{ value: '' }]
      });
    }

    if (this.state.current === 2 && e.target.name === 'firmwareHash') {
      this.setState({
        firmware: ''
      });
    }
  }

  generateEthWallet() {
    console.log(`Generating new Ethereum wallet`);
    const newWallet = ethWallet.generate();

    let publicKey = newWallet.getPublicKey().toString('hex');
    let privateKey = newWallet.getPrivateKey().toString('hex');
    let address = newWallet.getAddressString();

    console.log(`Private key: ${privateKey}`);
    console.log(`Public key: ${publicKey}`);
    console.log(`Address: ${address}`);

    this.setState({
      identifier: address,
      showIdentifierInfo: true,
      address,
      publicKey,
      privateKey,
      curve: 'secp256k1'
    })
  }

  generateEcKeyPair(curve) {
    let ec = new EC(curve);
    console.log(`Generating new ${curve} key pair`);
    let keyPair = ec.genKeyPair();

    let publicKey = keyPair.getPublic(true, 'hex');
    let privateKey = keyPair.getPrivate('hex');

    console.log(`Private key: ${privateKey}`);
    console.log(`Public key compressed: ${publicKey}`);
    console.log(`Public key uncompressed: ${keyPair.getPublic().encode('hex')}`);

    this.setState({
      identifier: publicKey,
      showIdentifierInfo: true,
      address: '',
      publicKey,
      privateKey,
      curve
    })
  }

  inputChange=(data)=>{
    this.setState({
      identifier:data
    })
  }

  pwdChange=(data)=>{
    this.setState({
      pwd:data.target.value
    })
  }

  calculateMetadataHash() {
    let elements = this.state.metadata.map(el => sha3(el.value));
    console.log(`Generating Merkle root hash`);

    let metadataRootSha3 = merkleRoot(elements);
    console.log(`Merkle root hash ${metadataRootSha3.toString('hex')}`);

    this.setState({
      metadataHash: metadataRootSha3.toString('hex')
    })
  }

  calculateFirmwareHash() {
    let firmwareHash = sha3(this.state.firmware);

    this.setState({
      firmwareHash: firmwareHash.toString('hex')
    })
  }

  removeMetadataField(k) {
    const { metadata } = this.state;
    metadata.splice(k, 1);
    this.setState({
      metadata
    })
  }

  addMetadataField() {
    const { metadata } = this.state;
    metadata.push({ value: '' });
    this.setState({
      metadata
    });
  }

  handleMetadataChange(e, index) {
    const { metadata } = this.state;
    metadata[index].value = e.target.value;

    this.setState({
      metadata
    });
  }

  downloadConfiguration() {
    const { identifier, metadataHash, firmwareHash, metadata, firmware, address, publicKey, privateKey, curve, deviceId } = this.state;

    const configuration = {
      identifier,
      metadataHash,
      firmwareHash,
    };

    if (metadata.length > 0 && metadata[0].value !== '' && metadataHash !== '') {
      configuration.metadata = metadata.map(el => el.value);
    }

    if (firmware !== '' && firmwareHash !== '') {
      configuration.firmware = firmware;
    }

    if (address !== '') {
      configuration.address = address;
    }

    if (publicKey !== '') {
      configuration.publicKey = publicKey;
    }

    if (privateKey !== '') {
      configuration.privateKey = privateKey;
    }

    if (curve !== '') {
      configuration.curve = curve;
    }

    if (deviceId !== '') {
      configuration.deviceId = deviceId;
    }

    let configurationJson = JSON.stringify(configuration);

    let element = document.createElement("a");
    let file = new Blob([configurationJson], { type: 'text/json' });
    element.href = URL.createObjectURL(file);
    element.download = `device_${deviceId}.json`;
    element.click();
  }

  onCurveSelect({ key }) {
    this.generateEcKeyPair(key);
  };

  getContentForStep(step) {
    const { identifier, metadataHash, firmwareHash, metadata, firmware } = this.state;

    // Identifier
    // if (step === 0) {
    //   const curves = ['p224', 'curve25519'];
    //   const ecMenu = (
    //     <Menu onClick={(e) => this.onCurveSelect(e)}>
    //       {curves.map(curve => <Menu.Item key={curve}>{curve}</Menu.Item>)}
    //     </Menu>
    //   );
    //   return (
    //     <div>
    //       <p>
    //         <strong>Unique device identifier</strong> is a public key or a fingerprint of RSA/ECC public key. It can also be an Ethereum address (recommended).
    //       </p>
    //       <Select
    //           style={{ width: '800px' }}
    //           placeholder="Identifier e.g. Ethereum address"
    //           value={identifier}
    //           name="identifier"
    //           maxLength="66"
    //           onChange={this.inputChange}
    //       >
    //         {this.state.devices.map(item => <Option key={item}>{item}</Option>)}
    //       </Select>
    //       <Input
    //           onChange={this.pwdChange}
    //           style={{ width: 'calc(20%)' }}
    //           addonBefore="密码"/>
    //
    //       {/*<Input*/}
    //       {/*  placeholder="Identifier e.g. Ethereum address"*/}
    //       {/*  style={{ maxWidth: '800px' }}*/}
    //       {/*  value={identifier}*/}
    //       {/*  name="identifier"*/}
    //       {/*  maxLength="66"*/}
    //       {/*  onChange={(e) => this.handleChange(e)}*/}
    //       {/*/>*/}
    //       <br /><br />
    //       {/*<Button.Group size="large">*/}
    //       {/*  <Button type="primary" onClick={() => this.generateEthWallet()}>Generate Ethereum wallet</Button>*/}
    //       {/*  <Dropdown overlay={ecMenu}>*/}
    //       {/*    <Button type="primary">*/}
    //       {/*      Generate elliptic curve key pair*/}
    //       {/*    </Button>*/}
    //       {/*  </Dropdown>*/}
    //       {/*</Button.Group>*/}
    //       {this.state.showIdentifierInfo ?
    //         <div>
    //           <br />
    //           <Alert message="You will be given private key and device configuration on the last step." type="info" showIcon />
    //         </div> : null}
    //     </div>
    //   );
    // }

    // Metadata hash
    if (step === 0) {
      return (
        <div>
          <p>
            <strong>Metadash hash</strong> is Merkle root hash of device information or just a hash of any data.
          </p>
          <Input
            placeholder="Metadata hash"
            style={{ maxWidth: '800px' }}
            value={metadataHash}
            name="metadataHash"
            maxLength="66"
            onChange={(e) => this.handleChange(e)}
          />
          <Divider />
          <p>
            If you already don't have one, you can use inputs below to generate SHA-3 (Keccak) hash. With multiple fields, Merkle tree will be used.
          </p>
          <br />
          <Form>
            {metadata.map((key, index) => {
              return (
                <FormItem>
                  <Input
                    placeholder="Some information"
                    style={{ width: '60%' }}
                    value={key.value}
                    maxLength="66"
                    onChange={(e) => this.handleMetadataChange(e, index)}
                  />
                  {metadata.length > 1 ? (
                    <Icon
                      className="dynamic-delete-button"
                      type="minus-circle-o"
                      disabled={metadata.length === 1}
                      onClick={() => this.removeMetadataField(index)}
                    />
                  ) : null}
                </FormItem>
              )
            })
            }
            <FormItem>
              <Button type="dashed" onClick={() => this.addMetadataField()} style={{ width: '60%' }}>
                <Icon type="plus" /> Add field
              </Button>
            </FormItem>
            <FormItem>
              <Button type="primary" onClick={() => this.calculateMetadataHash()}>Generate</Button>
            </FormItem>
          </Form>
        </div>
      );
    }

    // Firmware hash
    if (step === 1) {
      return (
        <div>
          <p>
            <strong>Firmware hash</strong> is a hash of actual firmware hash. Actual firmware hash is not supposed to be stored.
        </p>
          <Input
            placeholder="Firmware hash"
            style={{ maxWidth: '800px' }}
            value={firmwareHash}
            name="firmwareHash"
            maxLength="66"
            onChange={(e) => this.handleChange(e)}
          />
          <Divider />
          <p>
            You can use input to generate SHA-3 (Keccak) hash of any data.
          </p>
          <br />
          <Input
            placeholder="Some data"
            style={{ width: '60%' }}
            value={firmware}
            name="firmware"
            onChange={(e) => this.handleChange(e)}
          />
          <br />
          <br />
          <Button type="primary" onClick={() => this.calculateFirmwareHash()}>Generate</Button>
        </div>
      );
    }

    // Overview/confirm
    if (step === 2) {
      return (
        <div>
          <Card title={<div>Identifier  {identifier} <a><Icon type="edit" onClick={() => this.gotoStep(0)} /></a></div>} bordered={false}>
            <Meta
              title={<div>Metadata hash {metadataHash.length > 0 ? metadataHash : 'empty'} <a><Icon type="edit" onClick={() => this.gotoStep(1)} /></a></div>}
              description={<div>Firmware hash {firmwareHash.length > 0 ? firmwareHash : 'empty'} <a><Icon type="edit" onClick={() => this.gotoStep(2)} /></a></div>}
            />
          </Card>
        </div >
      );
    }

    // Configuration
    if (step === 3) {
      return (
        <div style={{ textAlign: 'center' }}>
          <Icon type="check-circle-o" style={{ fontSize: 46 }} />
          <br /><br />
          <p>
            Click below to download device configuration.
          </p>
          <br />
          <Button type="primary" onClick={() => this.downloadConfiguration()}>Download</Button>
        </div>
      );
    }
  }

  async createDevice() {
    const { identifier, metadataHash, firmwareHash, address } = this.state;

    //let address = newWallet.getAddressString();

    try {
      //let instance = await DeviceManager;

      let identifierToSave = identifier;
      if (address !== '') {
        let addressToPad = address;
        if (address.startsWith('0x')) {
          addressToPad = addressToPad.substring(2);
        }
        identifierToSave = setLengthLeft(Buffer.from(addressToPad, 'hex'), 32).toString('hex');
      }



      // let filter=this.state.web3.eth.filter("latest");
      // filter.watch(function (error,log){
      //   console.log("")
      // });
      //let account = this.state.web3.personal.newAccount("");

    //   var keythereum = require("keythereum");
    // //keystore密钥存放目录，在project目录下的keystore目录下，密钥以address命名
    //   var datadir = "D:\\Personal\\学生科研\\final\\node\\keystore\\UTC--2022-05-22T08-22-09.180330800Z--5e84de7bd940923649a0c07759b819a994d058f1";
    //   var address1= "5e84de7bd940923649a0c07759b819a994d058f1";
    //   const password = "123";
    //
    //   var keyObject = keythereum.importFromFile(address1, datadir);
    //   var privateKey1 = keythereum.recover(password, keyObject);
    //   console.log(privateKey1.toString('hex'));




      // let rawTx = {
      //   nonce:0,
      //   from:addHexPrefix(this.state.identifier),
      //   to:addHexPrefix(this.state.identifier),
      //   type:1,
      //   value:0,
      //   gasPrice:0,
      //   // metadataHash:addHexPrefix(metadataHash),
      //   // firmwareHash:addHexPrefix(firmwareHash)
      //   // metadataHash:metadataHash,
      //   // firmwareHash:firmwareHash
      // }

      //console.log("privateKey:"+this.state.privateKey);
      this.state.web3.personal.importRawKey(this.state.privateKey,"");

      // const EthereumTx = require('ethereumjs-tx').Transaction;
      //
      // let tx = new EthereumTx(rawTx);
      // let privateKey = new Buffer(this.state.privateKey, 'hex');
      // tx.sign(privateKey);
      // let serializedTx = tx.serialize();
      //
      // console.log(tx);
      // console.log(serializedTx.toString('hex'));
      //
      // this.state.web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
      //    if(!err){
      //      console.log(hash)
      //    } else {
      //      console.log(err);
      //    }
      // });
      // this.state.identifier = "0x5e84de7bd940923649a0c07759b819a994d058f1";
      //alert(this.state.identifier)
      this.state.web3.personal.unlockAccount(this.state.identifier,"",(err,res)=>{
        if(err)
          console.log('Error',err)
        else{
          this.state.web3.eth.sendTransaction({
              from:this.state.identifier,
              to:this.state.identifier,
              type:1,
              value:0,
              gasPrice:0,
              metadataHash:addHexPrefix(metadataHash),
              firmwareHash:addHexPrefix(firmwareHash)
          });
          this.state.web3.eth.sendTransaction({
            from:this.state.identifier,
            to:this.state.identifier,
            type:3,
            value:0,
            gasPrice:0
          });
          //alert("设备创建成功,等待挖矿确认");
        }
      });

      //let result=await instance.createDevice(addHexPrefix(identifierToSave), addHexPrefix(metadataHash), addHexPrefix(firmwareHash), { from: getDefaultAccount() });

      //let result = await instance.createDevice(addHexPrefix(identifierToSave), addHexPrefix(metadataHash), addHexPrefix(firmwareHash), { from: getDefaultAccount() });
      this.watchForChanges();
      openNotificationWithIcon('info', 'Transaction sent', 'Once mined, your device will be registered.');
      this.setState({
        loading: true
        // loading: false
      });
      // this.next();
    } catch (error) {
      console.log(error);
      message.error(error.message);
    }
  }

  render() {
    const { current } = this.state;
    return (
      <div>
        <Spin spinning={this.state.loading} className="loading-spin">
          <Steps current={current}>
            {steps.map(item => <Step key={item.title} title={item.title} />)}
          </Steps>
          <div className="steps-content">{this.getContentForStep(current)}</div>
          <div className="steps-action">
            {
              current < steps.length - 1
              && <Button type="primary" onClick={() => this.next()}>Next</Button>
            }
            {
              current === steps.length - 1
              && <Button type="primary" onClick={() => this.createDevice()}>Register</Button>
            }
            {
              current > 0 && current !== 4
              && (
                <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
                  Previous
            </Button>
              )
            }
            {
              current === 4
              && (
                <Button type="primary" onClick={() => this.reset()}>
                  Reset
            </Button>
              )
            }
          </div>
        </Spin>
      </div>
    );
  }
}

export default RegisterDevice;
