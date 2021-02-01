const {
  syflPools,
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
  
  const share = await Share.deployed();

  const lpPoolETHYFLUSD = artifacts.require(syflPools.ETHYFLUSD.contractName);
  const lpPoolETHSYFL = artifacts.require(syflPools.ETHSYFL.contractName);
  const lpPoolLINKYFLUSD = artifacts.require(syflPools.LINKYFLUSD.contractName);
  const lpPoolLINKSYFL = artifacts.require(syflPools.LINKSYFL.contractName);

  await deployer.deploy(
    InitialShareDistributor,
    share.address,
    lpPoolETHYFLUSD.address,
    totalBalanceForETHYFLUSD.toString(),
    lpPoolETHSYFL.address,
    totalBalanceForETHSYFL.toString(),
    lpPoolLINKYFLUSD.address,
    totalBalanceForLINKYFLUSD.toString(),
    lpPoolLINKSYFL.address,
    totalBalanceForLINKSYFL.toString()
  );
}

module.exports = migration;
