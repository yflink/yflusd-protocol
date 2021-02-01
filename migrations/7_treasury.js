const contract = require('@truffle/contract');
const { POOL_START_DATE } = require('./pools');
const knownContracts = require('./known-contracts');

const Cash = artifacts.require('Cash');
const Bond = artifacts.require('Bond');
const Share = artifacts.require('Share');
const IERC20 = artifacts.require('IERC20');
const ILinkswapPriceOracle = artifacts.require('ILinkswapPriceOracle');
const MockWeth = artifacts.require('MockWeth');
const MockYfl = artifacts.require('MockYfl');
const MockLink = artifacts.require('MockLink');
const MockLinkswapPriceOracle = artifacts.require('MockLinkswapPriceOracle');

const Oracle = artifacts.require('Oracle');
const LinearThreshold = artifacts.require('LinearThreshold');
const Boardroom = artifacts.require('Boardroom');
const Treasury = artifacts.require('Treasury');
const SimpleFund = artifacts.require('SimpleERCFund');

const LinkswapFactory = artifacts.require('LinkswapFactory');
const LinkswapRouter = artifacts.require('LinkswapRouter');

const DAY = 86400;

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
 
  let Curve = await LinearThreshold.deployed();
  let BondOracle = await Oracle.at('0x92E5D50C976DDDEAe99C20BAf4476d2F2E8ba69b');
  let SeigniorageOracle = await Oracle.deployed();
  
  let startTime = POOL_START_DATE;
  if (network === 'mainnet') {
    startTime += 6 * DAY;
  }
  
  await deployer.deploy(
    Treasury,
    weth.address,
    cash.address,
    Bond.address,
    Share.address,
    BondOracle.address,
    SeigniorageOracle.address,
    linkswapPriceOracle.address,
    Boardroom.address,
    SimpleFund.address,
    Curve.address,
    startTime,
  );
}

module.exports = migration;