const knownContracts = require('./known-contracts');
const { POOL_START_DATE } = require('./pools');

const Share = artifacts.require('Share');
const Oracle = artifacts.require('Oracle');
const MockLink = artifacts.require('MockLink');
const IERC20 = artifacts.require('IERC20');

const LINKSYFLLPToken_SYFLPool = artifacts.require('LINKSYFLLPTokenSharePool')

const LinkswapFactory = artifacts.require('LinkswapFactory');

module.exports = async (deployer, network, accounts) => {
  const linkswapFactory = ['dev', 'dev-fork'].includes(network)
    ? await LinkswapFactory.deployed()
    : await LinkswapFactory.at(knownContracts.LinkswapFactory[network]);
    
  const link = network === 'mainnet'
    ? await IERC20.at(knownContracts.LINK[network])
    : await MockLink.deployed();

  const oracle = await Oracle.deployed();

  const link_syfl_lpt = await oracle.pairFor(linkswapFactory.address, Share.address, link.address);

  await deployer.deploy(LINKSYFLLPToken_SYFLPool, Share.address, link_syfl_lpt, POOL_START_DATE);
};
