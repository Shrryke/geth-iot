module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    //truffle migrate --network privateNet
    privateNet: {
      host:"127.0.0.1",
      port:8545,
      network_id: "2859969064"
    }
  }
};
//development
