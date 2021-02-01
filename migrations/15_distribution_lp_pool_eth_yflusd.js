const knownContracts = require('./known-contracts');
const { POOL_START_DATE } = require('./pools');

const Cash = artifacts.require('Cash');
const Share = artifacts.require('Share');
const Oracle = artifacts.require('Oracle');
const MockWeth = artifacts.require('MockWeth');
const IERC20 = artifacts.require('IERC20');

const ETHYFLUSDLPToken_SYFLPool = artifacts.require('ETHYFLUSDLPTokenSharePool')

const LinkswapFactory = artifacts.require('LinkswapFactory');

module.exports = async (deployer, network, accounts) => {
  const linkswapFactory = ['dev', 'dev-fork'].includes(network)
    ? await LinkswapFactory.deployed()
    : await LinkswapFactory.at(knownContracts.LinkswapFactory[network]);
    
  const weth = network === 'mainnet'
    ? await IERC20.at(knownContracts.WETH[network])
    : await MockWeth.deployed();

  const oracle = await Oracle.deployed();

  const eth_yflusd_lpt = await oracle.pairFor(linkswapFactory.address, Cash.address, weth.address);

  await deployer.deploy(ETHYFLUSDLPToken_SYFLPool, Share.address, eth_yflusd_lpt, POOL_START_DATE);
};
