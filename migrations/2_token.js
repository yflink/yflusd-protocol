// ============ Contracts ============

// Token
// deployed first
const Cash = artifacts.require('Cash')
const Bond = artifacts.require('Bond')
const Share = artifacts.require('Share')
const MockWeth = artifacts.require('MockWeth');
const MockYfl = artifacts.require('MockYfl');
const MockLink = artifacts.require('MockLink');

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([deployToken(deployer, network, accounts)])
}

module.exports = migration

// ============ Deploy Functions ============

async function deployToken(deployer, network, accounts) {
  await deployer.deploy(Cash, accounts[0]);
  await deployer.deploy(Bond, accounts[0]);
  await deployer.deploy(Share, accounts[0]);

  if (network !== 'mainnet') {
    const weth = await deployer.deploy(MockWeth);
    console.log(`MockWETH address: ${weth.address}`);
    
    const yfl = await deployer.deploy(MockYfl);
    console.log(`MockYFL address: ${yfl.address}`);
    
    const link = await deployer.deploy(MockLink);
    console.log(`MockLINK address: ${link.address}`);
  }
}
