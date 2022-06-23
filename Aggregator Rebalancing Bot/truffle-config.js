require('babel-register');
require('babel-polyfill');
const {ethers,providers}=require("./node_modules/ethers")
module.exports = {
  networks: {
    development: {
      provider: () => {
        return new providers.WebSocketProvider("wss://eth-mainnet.alchemyapi.io/v2/hpajxa09MK62rlLiJYylr2wElIzVFDRd:7545");
      },
      network_id: '*'
    },
  },
  contracts_directory: './contracts',
  contracts_build_directory: './build',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}