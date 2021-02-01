pragma solidity ^0.6.0;

import '@openzeppelin/contracts/math/SafeMath.sol';

import "../lib/SafeMathLinkswap.sol";
import '../interfaces/ILinkswapPriceOracle.sol';

contract MockLinkswapPriceOracle is ILinkswapPriceOracle {
    using SafeMath for uint256;

    uint256 public _tokenAmount;
    uint256 public _usdAmount;

    constructor() public {
        _tokenAmount = 1e18;
        _usdAmount = 1e8;
    }

    function setTokenAmount(uint256 tokenAmount) public {
        _tokenAmount = tokenAmount;
    }

    function setUsdAmount(uint256 usdAmount) public {
        _usdAmount = usdAmount;
    }

    function update() 
        external
        override
    {
    }

    // tokenAmount is to 18 dp, usdAmount is to 8 dp
    // token must be LINK / WETH / YFL
    function calculateTokenAmountFromUsdAmount(address token, uint256 usdAmount)
        external
        override
        view
        returns (uint256 tokenAmount)
    {
        tokenAmount = _tokenAmount;
    }

    // token must be LINK / WETH
    function calculateUsdAmountFromTokenAmount(address token, uint256 tokenAmount)
        external
        override
        view
        returns (uint256 usdAmount)
    {
        usdAmount = _usdAmount;
    }
}
