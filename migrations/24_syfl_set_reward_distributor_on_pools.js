const {
  syflPools,
} = require('./pools');

// Pools
// deployed first
const Share = artifacts.require('Share');
const InitialShareDistributor = artifacts.require('InitialShareDistributor');

// ============ Main Migration ============

async function migration(deployer, network, accounts) {
  
  const lpPoolETHYFLUSD = artifacts.require(syflPools.ETHYFLUSD.contractName);
  const lpPoolETHSYFL = artifacts.require(syflPools.ETHSYFL.contractName);
  const lpPoolLINKYFLUSD = artifacts.require(syflPools.LINKYFLUSD.contractName);
  const lpPoolLINKSYFL = artifacts.require(syflPools.LINKSYFL.contractName);
  
  const distributor = await InitialShareDistributor.deployed();
  
  console.log(`Setting distributor to InitialShareDistributor (${distributor.address})`);
  await lpPoolETHYFLUSD.deployed().then(pool => pool.setRewardDistribution(distributor.address));
  await lpPoolETHSYFL.deployed().then(pool => pool.setRewardDistribution(distributor.address));
  await lpPoolLINKYFLUSD.deployed().then(pool => pool.setRewardDistribution(distributor.address));
  await lpPoolLINKSYFL.deployed().then(pool => pool.setRewardDistribution(distributor.address));
}

module.exports = migration;
