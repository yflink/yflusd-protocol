pragma solidity ^0.6.0;

import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import '../interfaces/IDistributor.sol';
import '../interfaces/IRewardDistributionRecipient.sol';

contract InitialShareDistributor is IDistributor {
    using SafeMath for uint256;

    event Distributed(address pool, uint256 cashAmount);

    bool public once = true;

    IERC20 public share;
    
    IRewardDistributionRecipient public ethyflusdLPPool;
    uint256 public ethyflusdInitialBalance;
    IRewardDistributionRecipient public ethsyflLPPool;
    uint256 public ethsyflInitialBalance;
    
    IRewardDistributionRecipient public linkyflusdLPPool;
    uint256 public linkyflusdInitialBalance;
    IRewardDistributionRecipient public linksyflLPPool;
    uint256 public linksyflInitialBalance;

    constructor(
        IERC20 _share,
        IRewardDistributionRecipient _ethyflusdLPPool,
        uint256 _ethyflusdInitialBalance,
        IRewardDistributionRecipient _ethsyflLPPool,
        uint256 _ethsyflInitialBalance,
        IRewardDistributionRecipient _linkyflusdLPPool,
        uint256 _linkyflusdInitialBalance,
        IRewardDistributionRecipient _linksyflLPPool,
        uint256 _linksyflInitialBalance
    ) public {
        share = _share;
        
        ethyflusdLPPool = _ethyflusdLPPool;
        ethyflusdInitialBalance = _ethyflusdInitialBalance;
        ethsyflLPPool = _ethsyflLPPool;
        ethsyflInitialBalance = _ethsyflInitialBalance;
        
        linkyflusdLPPool = _linkyflusdLPPool;
        linkyflusdInitialBalance = _linkyflusdInitialBalance;
        linksyflLPPool = _linksyflLPPool;
        linksyflInitialBalance = _linksyflInitialBalance;
    }

    function distribute() public override {
        require(
            once,
            'InitialShareDistributor: you cannot run this function twice'
        );

        share.transfer(address(ethyflusdLPPool), ethyflusdInitialBalance);
        ethyflusdLPPool.notifyRewardAmount(ethyflusdInitialBalance);
        emit Distributed(address(ethyflusdLPPool), ethyflusdInitialBalance);

        share.transfer(address(ethsyflLPPool), ethsyflInitialBalance);
        ethsyflLPPool.notifyRewardAmount(ethsyflInitialBalance);
        emit Distributed(address(ethsyflLPPool), ethsyflInitialBalance);
        
        share.transfer(address(linkyflusdLPPool), linkyflusdInitialBalance);
        linkyflusdLPPool.notifyRewardAmount(linkyflusdInitialBalance);
        emit Distributed(address(linkyflusdLPPool), linkyflusdInitialBalance);

        share.transfer(address(linksyflLPPool), linksyflInitialBalance);
        linksyflLPPool.notifyRewardAmount(linksyflInitialBalance);
        emit Distributed(address(linksyflLPPool), linksyflInitialBalance);

        once = false;
    }
}
