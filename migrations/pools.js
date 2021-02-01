// https://learn.yflink.io/mechanisms/yield-farming
const INITIAL_YFLUSD_FOR_POOLS = 248500;
const INITIAL_SYFL_FOR_ETH_YFLUSD = 859500;
const INITIAL_SYFL_FOR_ETH_SYFL = 339000;
const INITIAL_SYFL_FOR_LINK_YFLUSD = 900000;
const INITIAL_SYFL_FOR_LINK_SYFL = 400000;

const POOL_START_DATE = Date.parse('2021-01-31T00:00:00Z') / 1000;

const yflusdPools = [
  { contractName: 'YFLUSDYYFLPool', token: 'YYFL' },
  { contractName: 'YFLUSDLINKPool', token: 'LINK' },
  { contractName: 'YFLUSDMASQPool', token: 'MASQ' },
  { contractName: 'YFLUSDBONKPool', token: 'BONK' },
  { contractName: 'YFLUSDDOKIPool', token: 'DOKI' },
  { contractName: 'YFLUSDSYAXPool', token: 'SYAX' },
];

const syflPools = {
  ETHYFLUSD: { contractName: 'ETHYFLUSDLPTokenSharePool', token: 'LSLP' },
  ETHSYFL: { contractName: 'ETHSYFLLPTokenSharePool', token: 'LSLP' },
  LINKYFLUSD: { contractName: 'LINKYFLUSDLPTokenSharePool', token: 'LSLP' },
  LINKSYFL: { contractName: 'LINKSYFLLPTokenSharePool', token: 'LSLP' },
}

module.exports = {
  POOL_START_DATE,
  INITIAL_YFLUSD_FOR_POOLS,
  INITIAL_SYFL_FOR_ETH_YFLUSD,
  INITIAL_SYFL_FOR_ETH_SYFL,
  INITIAL_SYFL_FOR_LINK_YFLUSD,
  INITIAL_SYFL_FOR_LINK_SYFL,
  yflusdPools,
  syflPools,
};
