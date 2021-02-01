const { yflusdPools, INITIAL_YFLUSD_FOR_POOLS } = require('./pools');

// Pools
// deployed first
const Cash = artifacts.require('Cash')
const InitialCashDistributor = artifacts.require('InitialCashDistributor');

// ============ Main Migration ============

module.exports = async (deployer, network, accounts) => {
  const unit = web3.utils.toBN(10 ** 18);
  const initialCashAmount = unit.muln(INITIAL_YFLUSD_FOR_POOLS).toString();

  const cash = await Cash.deployed();
  const pools = yflusdPools.map(({contractName}) => artifacts.require(contractName));

  await deployer.deploy(
    InitialCashDistributor,
    cash.address,
    pools.map(p => p.address),
    initialCashAmount,
  );
}
