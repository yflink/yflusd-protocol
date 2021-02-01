import chai, { expect } from 'chai';
import { ethers } from 'hardhat';
import { solidity } from 'ethereum-waffle';
import { Contract, ContractFactory, BigNumber, utils } from 'ethers';

import LinkswapFactory from '../build/contracts/LinkswapFactory.json';
import LinkswapRouter from '../build/contracts/LinkswapRouter.json';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { Provider } from '@ethersproject/providers';

import { advanceTimeAndBlock, latestBlocktime } from './shared/utilities';

chai.use(solidity);

async function addLiquidity(
  provider: Provider,
  operator: SignerWithAddress,
  router: Contract,
  tokenA: Contract,
  tokenB: Contract,
  amount: BigNumber
): Promise<void> {
  await router
    .connect(operator)
    .addLiquidity(
      tokenA.address,
      tokenB.address,
      amount,
      amount,
      amount,
      amount,
      operator.address,
      (await latestBlocktime(provider)) + 1800
    );
}

async function approvePairViaGovernance(
  governance: SignerWithAddress,
  factory: Contract,
  tokenA: Contract,
  tokenB: Contract
): Promise<void> {
  await factory
    .connect(governance)
    .approvePairViaGovernance(
      tokenA.address,
      tokenB.address
    );
}

async function createPair(
  operator: SignerWithAddress,
  factory: Contract,
  newToken: Contract,
  newTokenAmount: BigNumber,
  lockupToken: Contract,
  lockupTokenAmount: BigNumber,
  lockupPeriod: BigNumber,
  listingFeeToken: Contract
): Promise<void> {
  await factory
    .connect(operator)
    .createPair(
      newToken.address,
      newTokenAmount,
      lockupToken.address,
      lockupTokenAmount,
      lockupPeriod,
      listingFeeToken.address
    );
}


describe('Oracle', () => {
  const MINUTE = 60;
  const DAY = 86400;
  const ETH = utils.parseEther('1');

  const { provider } = ethers;

  let operator: SignerWithAddress;
  let whale: SignerWithAddress;
  let governance: SignerWithAddress;

  before('setup accounts', async () => {
    [operator, whale, governance] = await ethers.getSigners();
  });

  let Cash: ContractFactory;
  let Share: ContractFactory;
  let Oracle: ContractFactory;
  let MockWETH: ContractFactory;
  let MockYFL: ContractFactory;
  let MockLINK: ContractFactory;
  let MockLinkswapPriceOracle: ContractFactory;

  // linkswap
  let Factory = new ContractFactory(
    LinkswapFactory.abi,
    LinkswapFactory.bytecode
  );
  let Router = new ContractFactory(
    LinkswapRouter.abi,
    LinkswapRouter.bytecode
  );

  before('fetch contract factories', async () => {
    Cash = await ethers.getContractFactory('Cash');
    Share = await ethers.getContractFactory('Share');
    Oracle = await ethers.getContractFactory('Oracle');
    MockWETH = await ethers.getContractFactory('MockWeth');
    MockYFL = await ethers.getContractFactory('MockYfl');
    MockLINK = await ethers.getContractFactory('MockLink');
    MockLinkswapPriceOracle = await ethers.getContractFactory('MockLinkswapPriceOracle');
  });

  let factory: Contract;
  let router: Contract;
  let linkswapPriceOracle: Contract;
  let weth: Contract;
  let link: Contract;
  let yfl: Contract;
  let cash: Contract;
  let share: Contract;
  let oracle: Contract;
  let oracleStartTime: BigNumber;

  before('deploy linkswap', async () => {
    
    weth = await MockWETH.connect(operator).deploy();
    link = await MockLINK.connect(operator).deploy();
    yfl = await MockYFL.connect(operator).deploy();
    linkswapPriceOracle = await MockLinkswapPriceOracle.connect(operator).deploy();
    
    factory = await Factory.connect(operator).deploy(
      governance.address,
      governance.address,
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
      yfl.address);
      
    router = await Router.connect(operator).deploy(
      factory.address,
      operator.address
    );
  });

  beforeEach('deploy contracts', async () => {
    
    cash = await Cash.connect(operator).deploy(operator.address);
    share = await Share.connect(operator).deploy(operator.address);
    
    await weth.connect(operator).mint(operator.address, ETH.mul(2));
    await weth.connect(operator).approve(router.address, ETH.mul(2));
    await cash.connect(operator).mint(operator.address, ETH);
    await cash.connect(operator).approve(router.address, ETH);
    
    await approvePairViaGovernance(governance, factory, cash, weth);
    await createPair(operator, factory, cash, BigNumber.from(0), weth, BigNumber.from(0), BigNumber.from(0), weth);
    await addLiquidity(provider, operator, router, cash, weth, ETH);

    oracleStartTime = BigNumber.from(await latestBlocktime(provider)).add(DAY);
    oracle = await Oracle.connect(operator).deploy(
      factory.address,
      cash.address,
      weth.address,
      DAY,
      oracleStartTime
    );
  });

  describe('#update', async () => {
    it('should works correctly', async () => {
      await advanceTimeAndBlock(
        provider,
        oracleStartTime.sub(await latestBlocktime(provider)).toNumber() - MINUTE
      );

      // epoch 0
      await expect(oracle.update()).to.revertedWith('Epoch: not started yet');
      expect(await oracle.nextEpochPoint()).to.eq(oracleStartTime);
      expect(await oracle.getCurrentEpoch()).to.eq(BigNumber.from(0));

      await advanceTimeAndBlock(provider, 2 * MINUTE);

      // epoch 1
      await expect(oracle.update()).to.emit(oracle, 'Updated');

      expect(await oracle.nextEpochPoint()).to.eq(oracleStartTime.add(DAY));
      expect(await oracle.getCurrentEpoch()).to.eq(BigNumber.from(0));
      // check double update
      await expect(oracle.update()).to.revertedWith('Epoch: not allowed');
    });
  });
});
