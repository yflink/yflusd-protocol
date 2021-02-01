const contract = require('@truffle/contract');
const knownContracts = require('./known-contracts');

const Cash = artifacts.require('Cash');
const IERC20 = artifacts.require('IERC20');
const ILinkswapPriceOracle = artifacts.require('ILinkswapPriceOracle');
const MockWeth = artifacts.require('MockWeth');
const MockYfl = artifacts.require('MockYfl');
const MockLink = artifacts.require('MockLink');
const MockLinkswapPriceOracle = artifacts.require('MockLinkswapPriceOracle');

const Oracle = artifacts.require('Oracle');

const LinkswapFactory = artifacts.require('LinkswapFactory');
const LinkswapRouter = artifacts.require('LinkswapRouter');

const HOUR = 60 * 60;
const DAY = 86400;
const ORACLE_START_DATE = Date.parse('2021-01-29T00:00:00Z') / 1000;

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

  const cash = await Cash.deployed();

  // 2. Deploy oracle for the pair between yflusd and weth
  const BondOracle = await deployer.deploy(
    Oracle,
    linkswapFactory.address,
    cash.address,
    weth.address,
    HOUR,
    ORACLE_START_DATE
  );
  
  const SeigniorageOracle = await deployer.deploy(
    Oracle,
    linkswapFactory.address,
    cash.address,
    weth.address,
    DAY,
    ORACLE_START_DATE
  );
}

module.exports = migration;