const {
  INITIAL_SYFL_FOR_ETH_YFLUSD,
  INITIAL_SYFL_FOR_ETH_SYFL,
  INITIAL_SYFL_FOR_LINK_YFLUSD,
  INITIAL_SYFL_FOR_LINK_SYFL,
} = require('./pools');

// Pools
// deployed first
const Share = artifacts.require('Share');
const InitialShareDistributor = artifacts.require('InitialShareDistributor');

// ============ Main Migration ============

async function migration(deployer, network, accounts) {
  const unit = web3.utils.toBN(10 ** 18);
  const totalBalanceForETHYFLUSD = unit.muln(INITIAL_SYFL_FOR_ETH_YFLUSD);
  const totalBalanceForETHSYFL = unit.muln(INITIAL_SYFL_FOR_ETH_SYFL);
  const totalBalanceForLINKYFLUSD = unit.muln(INITIAL_SYFL_FOR_LINK_YFLUSD);
  const totalBalanceForLINKSYFL = unit.muln(INITIAL_SYFL_FOR_LINK_SYFL);
  const totalBalance = totalBalanceForETHYFLUSD.add(totalBalanceForETHSYFL).add(totalBalanceForLINKYFLUSD).add(totalBalanceForLINKSYFL);
  
  const share = await Share.deployed();
  const distributor = await InitialShareDistributor.deployed();
  
  await share.mint(distributor.address, totalBalance.toString());
  console.log(`Deposited ${INITIAL_SYFL_FOR_ETH_YFLUSD + INITIAL_SYFL_FOR_ETH_SYFL + INITIAL_SYFL_FOR_LINK_YFLUSD + INITIAL_SYFL_FOR_LINK_SYFL} SYFL to InitialShareDistributor.`);
}

module.exports = migration;
