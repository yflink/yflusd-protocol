const knownContracts = require('./known-contracts');
const { POOL_START_DATE } = require('./pools');

const Share = artifacts.require('Share');
const Oracle = artifacts.require('Oracle');
const MockWeth = artifacts.require('MockWeth');
const IERC20 = artifacts.require('IERC20');

const ETHSYFLLPToken_SYFLPool = artifacts.require('ETHSYFLLPTokenSharePool')

const LinkswapFactory = artifacts.require('LinkswapFactory');

module.exports = async (deployer, network, accounts) => {
  const linkswapFactory = ['dev', 'dev-fork'].includes(network)
    ? await LinkswapFactory.deployed()
    : await LinkswapFactory.at(knownContracts.LinkswapFactory[network]);
    
  const weth = network === 'mainnet'
    ? await IERC20.at(knownContracts.WETH[network])
    : await MockWeth.deployed();

  const oracle = await Oracle.deployed();

  const eth_syfl_lpt = await oracle.pairFor(linkswapFactory.address, Share.address, weth.address);

  await deployer.deploy(ETHSYFLLPToken_SYFLPool, Share.address, eth_syfl_lpt, POOL_START_DATE);
};
