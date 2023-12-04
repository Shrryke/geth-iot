const request = require('request');
const { hashPersonalMessage, ecsign, ecrecover, toRpcSig, fromRpcSig, keccak256, addHexPrefix, sha3 } = require('ethereumjs-util');
const { default: MerkleTree, checkProof } = require('merkle-tree-solidity');
const args = process.argv.slice(2);
const [configPath] = args;

// Configuration file downloaded after registering device
const deviceConfig = require(configPath);

const hashMessageEth = message => hashPersonalMessage(Buffer.from(message));

const signMessageEth = (message, privateKey) => {
  let messageHash = hashMessageEth(message);
  //console.log('Message hash: ' + messageHash.toString('hex'));
  let { v, r, s } = ecsign(messageHash, privateKey);
  let rpcSignature = toRpcSig(v, r, s);
  //console.log('Message signature: ' + rpcSignature);
  return rpcSignature;
}

const validateSignatureEth = (messageHash, signature, publicKey, address) => {
  signature = fromRpcSig(signature);
  let recoveredPublicKey = ecrecover(messageHash, signature.v, signature.r, signature.s);
  let recoveredPublicKeyHex = recoveredPublicKey.toString('hex');
  let recoveredAddress = addHexPrefix(keccak256(recoveredPublicKey).toString('hex').substring(64 - 40));
  console.log('Recovered public key: ' + recoveredPublicKeyHex);
  console.log('public key: ' + publicKey);
  console.log('Recovered address: ' + recoveredAddress);
  console.log('address: ' + address);
  if (recoveredPublicKeyHex === publicKey && recoveredAddress === address) return true;
  return false;
}

// Gather data and sign
//"c0b1bb24821fae12eb8b487cadb1b1582299774f84ab78da43cd6a5b7509d6b4"
//deviceConfig.privateKey
const privateKey = Buffer.from(deviceConfig.privateKey, 'hex');

let message = 'test';
let signature = signMessageEth(message, privateKey);

// Validate signature
if (!validateSignatureEth(hashMessageEth(message), signature, deviceConfig.publicKey, deviceConfig.address)) {
  process.exit();
}

// Construct Merkle tree
const metadataHashes = deviceConfig.metadata.map(el => sha3(el));
const merkleTree = new MerkleTree(metadataHashes);

// Index of metadata element to send
const elementToSend = 0;

// Generate proof
let proof = merkleTree.getProof(metadataHashes[elementToSend]);
// console.log(checkProof(proof.toString(2), merkleTree.getRoot(), metadataHashes[elementToSend]));
proof = proof.map(el => addHexPrefix(el.toString('hex')));



console.log("message: ", message);
console.log("signature: ", signature);
console.log("metadata: ", deviceConfig.metadata[elementToSend]);
console.log("proof: ", proof);
console.log("firmware: ", deviceConfig.firmware);
// Build payload
let payload = {
  message,
  signature: signature,
  metadata: deviceConfig.metadata[elementToSend],
  proof,
  firmware: deviceConfig.firmware,
}

// Send to platform
const platformEndpoint = 'http://localhost:1337/receive'
request.post({ url: platformEndpoint, json: payload }, function (error, response, body) {
  if (!error) {
    console.log(body)
  } else {
    console.log(error);
  }
})
