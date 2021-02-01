// Pools
// deployed first
const InitialShareDistributor = artifacts.require('InitialShareDistributor');

// ============ Main Migration ============

async function migration(deployer, network, accounts) {
  
  const distributor = await InitialShareDistributor.deployed();
  await distributor.distribute();
}

module.exports = migration;
