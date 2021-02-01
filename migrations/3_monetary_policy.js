const contract = require('@truffle/contract');
const knownContracts = require('./known-contracts');

const Cash = artifacts.require('Cash');
const Share = artifacts.require('Share');
const IERC20 = artifacts.require('IERC20');
const ILinkswapPriceOracle = artifacts.require('ILinkswapPriceOracle');
const MockWeth = artifacts.require('MockWeth');
const MockYfl = artifacts.require('MockYfl');
const MockLink = artifacts.require('MockLink');
const MockLinkswapPriceOracle = artifacts.require('MockLinkswapPriceOracle');

const Boardroom = artifacts.require('Boardroom');

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

  // 2. provide liquidity to YFLUSD-ETH, SYFL-ETH pairs
  // if you don't provide liquidity to YFLUSD-ETH, SYFL-ETH pairs after step 1 and before step 3,
  //  creating Oracle will fail with NO_RESERVES error.
  const initSeigniorageUnit = web3.utils.toBN(10 ** 18).muln(1300).toString();
  const initEthUnit = web3.utils.toBN(10 ** 18).toString();
  const max = web3.utils.toBN(10 ** 18).muln(10000).toString();

  const cash = await Cash.deployed();
  const share = await Share.deployed();

  console.log('Approving Linkswap on tokens for liquidity');
  await Promise.all([
    approveIfNot(cash, accounts[0], linkswapRouter.address, max),
    approveIfNot(share, accounts[0], linkswapRouter.address, max),
    approveIfNot(weth, accounts[0], linkswapRouter.address, max),
    approveIfNot(link, accounts[0], linkswapRouter.address, max),
  ]);

  /*
  // Done manually by ArcSin2x
  console.log('Approving new pairs for YFLUSD and sYFL');
  await linkswapFactory.approvePairViaGovernance(cash.address, weth.address, {from: accounts[1]});
  await linkswapFactory.approvePairViaGovernance(share.address, weth.address, {from: accounts[1]});
  await linkswapFactory.approvePairViaGovernance(cash.address, link.address, {from: accounts[1]});
  await linkswapFactory.approvePairViaGovernance(share.address, link.address, {from: accounts[1]});
  */

  console.log('Create new pairs for YFLUSD and sYFL');
  await linkswapFactory.createPair(cash.address, 0, weth.address, 0, 0, weth.address);
  await linkswapFactory.createPair(share.address, 0, weth.address, 0, 0, weth.address);
  await linkswapFactory.createPair(cash.address, 0, link.address, 0, 0, link.address);
  await linkswapFactory.createPair(share.address, 0, link.address, 0, 0, link.address);
  
  // WARNING: msg.sender must hold enough WETH to add liquidity to YFLUSD-ETH, SYFL-ETH pools
  // otherwise transaction will revert
  console.log('Adding liquidity to pools');
  await linkswapRouter.addLiquidity(cash.address, weth.address, initSeigniorageUnit, initEthUnit, initSeigniorageUnit, initEthUnit, accounts[0], deadline());
  await linkswapRouter.addLiquidity(share.address, weth.address, initSeigniorageUnit, initEthUnit, initSeigniorageUnit, initEthUnit, accounts[0],  deadline());
  
  //Add liquidity to LINK pairs outside of script
  
  console.log(`ETH-YFLUSD pair address: ${await linkswapFactory.getPair(weth.address, cash.address)}`);
  console.log(`ETH-SYFL pair address: ${await linkswapFactory.getPair(weth.address, share.address)}`);
  console.log(`LINK-YFLUSD pair address: ${await linkswapFactory.getPair(link.address, cash.address)}`);
  console.log(`LINK-SYFL pair address: ${await linkswapFactory.getPair(link.address, share.address)}`);
 
  // Deploy boardroom
  await deployer.deploy(Boardroom, cash.address, share.address);
}

async function approveIfNot(token, owner, spender, amount) {
  const allowance = await token.allowance(owner, spender);
  if (web3.utils.toBN(allowance).gte(web3.utils.toBN(amount))) {
    return;
  }
  await token.approve(spender, amount);
  console.log(` - Approved ${token.symbol ? (await token.symbol()) : token.address}`);
}

function deadline() {
  // 30 minutes
  return Math.floor(new Date().getTime() / 1000) + 1800;
}

module.exports = migration;