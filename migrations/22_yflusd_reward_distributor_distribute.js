// Pools
// deployed first
const InitialCashDistributor = artifacts.require('InitialCashDistributor');

// ============ Main Migration ============

module.exports = async (deployer, network, accounts) => {
  const distributor = await InitialCashDistributor.deployed();
  
  await distributor.distribute();
}
