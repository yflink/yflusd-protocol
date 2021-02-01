const contract = require('@truffle/contract');
const knownContracts = require('./known-contracts');

const IERC20 = artifacts.require('IERC20');
const ILinkswapPriceOracle = artifacts.require('ILinkswapPriceOracle');
const MockWeth = artifacts.require('MockWeth');
const MockYfl = artifacts.require('MockYfl');
const MockLink = artifacts.require('MockLink');
const MockLinkswapPriceOracle = artifacts.require('MockLinkswapPriceOracle');

const LinearThreshold = artifacts.require('LinearThreshold');

const LinkswapFactory = artifacts.require('LinkswapFactory');
const LinkswapRouter = artifacts.require('LinkswapRouter');

async function migration(deployer, network, accounts) {
  let linkswapFactory, linkswapRouter;
  
  const weth = network === 'mainnet'
    ? await IERC20.at(knownContracts.WETH[network])
    : await MockWeth.deployed();
    
  const yfl = network === 'mainnet'
    ? await IERC20.at(knownContracts.YFL[network])
    : await MockYfl.deployed();
    
  const link = network === 'mainnet'
    ? await IERC20.at(knownContracts.LINK[network])
    : await MockLink.deployed();
  
  const linkswapPriceOracle = network === 'mainnet'
    ? await ILinkswapPriceOracle.at(knownContracts.LinkswapPriceOracle[network])
    : await deployer.deploy(MockLinkswapPriceOracle);
    
  if (['dev', 'dev-fork'].includes(network)) {
    
    console.log('Deploying Linkswap factory for testing.');
    linkswapFactory = await deployer.deploy(
      LinkswapFactory,
      accounts[1],
      accounts[1],
      linkswapPriceOracle.address,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      link.address,
      weth.address,
      yfl.address,
    );
      
    console.log('Deploying Linkswap router for testing.');
    linkswapRouter = await deployer.deploy(LinkswapRouter, linkswapFactory.address, accounts[1]);
  } else {
    linkswapFactory = await LinkswapFactory.at(knownContracts.LinkswapFactory[network]);
    linkswapRouter = await LinkswapRouter.at(knownContracts.LinkswapRouter[network]);
  }

  const minSupply = 0;
  const maxSupply = web3.utils.toBN(10 ** 19).muln(25000000).toString();
  const minCeiling = web3.utils.toBN(10 ** 16).muln(101).toString();
  const maxCeiling = web3.utils.toBN(10 ** 16).muln(105).toString();
  
  const Curve = await deployer.deploy(
    LinearThreshold,
    minSupply,
    maxSupply,
    minCeiling,
    maxCeiling
  );
}

module.exports = migration;