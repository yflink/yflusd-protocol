const knownContracts = require('./known-contracts');
const { yflusdPools, POOL_START_DATE } = require('./pools');

// Tokens
// deployed first
const Cash = artifacts.require('Cash');
const MockWeth = artifacts.require('MockWeth');

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    
    let contractName = 'YFLUSDBONKPool';
    let token = 'BONK';
    
    const tokenAddress = knownContracts[token][network] || MockWeth.address;
    if (!tokenAddress) {
      // network is mainnet, so MockWeth is not available
      throw new Error(`Address of ${token} is not registered on migrations/known-contracts.js!`);
    }

    const contract = artifacts.require(contractName);
    await deployer.deploy(contract, Cash.address, tokenAddress, POOL_START_DATE);
};
