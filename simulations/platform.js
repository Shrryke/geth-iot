const express = require('express');
const app = express();
const Web3 = require('web3');
const { hashPersonalMessage, addHexPrefix, sha3 } = require('ethereumjs-util');
const { default: MerkleTree, checkProof } = require('merkle-tree-solidity');
const hashMessageHex = message => addHexPrefix(hashPersonalMessage(Buffer.from(message)).toString('hex'));

app.use(express.json());

// Connect to local node
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8540"));


// Receive payload and validate on blockchain
app.post('/receive', function (req, resb) {
  console.log('received payload: ' + JSON.stringify(req.body));

  // Validate message
  const { message, signature } = req.body;
  let validMessage = web3.eth.accounts.recover(message, signature);
  console.log('valid message: ' + validMessage);
  web3.extend({
    property: 'myModule',
    methods: [
      {
        name:'getCandidateValue',
        call:'dpos_getCandidateValue',
        params:1,
        inputFormatter:[web3.extend.formatters.inputAddressFormatter],
      }
    ]});
  // Validate metadata
  const { metadata, proof } = req.body;
  let metadataHash = addHexPrefix(sha3(metadata).toString('hex'));
  // let validMetadata = deviceManager.isValidMetadataMember(deviceId, proof, metadataHash);

  // Validate firmware
  const { firmware } = req.body;
  let firmwareHash = addHexPrefix(sha3(firmware).toString('hex'));
  //let validFirmware = deviceManager.isValidFirmwareHash(deviceId, firmwareHash);

  // validate metadata/firmware
  let validate = web3.myModule.getCandidateValue(validMessage);
  validate.then(res => {
    const validMetadata = res[0];
    const validFirmware = res[1];
    console.log('From BlockChain');
    console.log('validMetadata:'+validMetadata);
    console.log('validFirmware:'+validFirmware);
    const root = Buffer.from(validMetadata.slice(2), 'hex');
    const proofs = proof.map(el => Buffer.from(el.slice(2), 'hex'));
    const vm = checkProof(proofs, root, sha3(metadata));
    const vf = (firmwareHash === validFirmware);
    // if vm & vf valid then res
    if (vm && vf) {
      resb.send({
        validMessage,
        validMetadata,
        validFirmware
      });
    }
  });
})

app.listen(1337, () => console.log('Platform simulation listening on port 1337'));
