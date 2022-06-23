pragma solidity >0.4.20 <=0.9.0;


interface DAI {
    function approve(address, uint256) external returns (bool);

    function transfer(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function balanceOf(address) external view returns (uint256);
}

interface cDAI {
    function mint(uint256) external returns (uint256);

    function redeem(uint256) external returns (uint256);

    function supplyRatePerBlock() external returns (uint256);

    function balanceOf(address) external view returns (uint256);
}


interface aDAI {
    function balanceOf(address) external view returns (uint256);
}

interface AaveLendingPool {
    function deposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external;

    function getReserveData(address asset)
        external
        returns (
            uint256 configuration,
            uint128 liquidityIndex,
            uint128 variableBorrowIndex,
            uint128 currentLiquidityRate,
            uint128 currentVariableBorrowRate,
            uint128 currentStableBorrowRate,
            uint40 lastUpdateTimestamp,
            address aTokenAddress,
            address stableDebtTokenAddress,
            address variableDebtTokenAddress,
            address interestRateStrategyAddress,
            uint8 id
        );
}

contract Aggregator {
    DAI dai =DAI(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    aDAI aDai= aDAI(0x028171bCA77440897B824Ca71D1c56caC55b68A3);
    cDAI cDai=cDAI(0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643);
    AaveLendingPool lending_pool=AaveLendingPool(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);

    address public Owner;
    address public fundsLocation;
    uint256 public amountDeposited;

    constructor() public{
        Owner = msg.sender;
    }

    modifier onlyOwner(){
        require(msg.sender==Owner);
        _;
    }
    

    function deposit(uint256 fund, uint256 _aveAPY, uint256 _compAPY) public {
        require(fund>0);
        

        if(amountDeposited>0){
            reBalance(_compAPY,_aveAPY);
        }

        dai.transferFrom(msg.sender, address(this), fund);
        amountDeposited=amountDeposited+fund;

        
        if(_aveAPY>_compAPY){
                _moveToAve();
                fundsLocation=address(lending_pool);
            }
        if(_compAPY>_aveAPY){
                require(_moveToComp()==0);
                fundsLocation=address(cDai);
            }
}


    function Withdraw() public onlyOwner {
        require(amountDeposited>0);
    if(fundsLocation==address(cDai)){
       _withdrawComp();
    }else{
       _withdrawAave();
    }

    dai.transfer(msg.sender,dai.balanceOf(address(this)));
    amountDeposited=0;

        }

function _withdrawComp()  internal returns(uint256){
    uint256 balance=cDai.balanceOf(address(this));
        uint256 result=cDai.redeem(balance);
        return result;
}

function _withdrawAave() internal {
        uint256 balance= aDai.balanceOf(address(this));
       lending_pool.withdraw(address(dai), balance, address(this));
       
}



    function _moveToAve() internal{

        require(dai.approve(address(lending_pool),10**50));
        lending_pool.deposit(address(dai), dai.balanceOf(address(this)), address(this),0);

    } 

function _moveToComp() internal returns(uint256){
    
    require(dai.approve(address(cDai), 10**50));
    uint256 result=cDai.mint(dai.balanceOf(address(this)));
    return result;

}
function whereBalance() public view returns(address){
    return fundsLocation;
    
}

function ContractBalance() public view returns(uint256){
if(fundsLocation==address(cDai)){
return dai.balanceOf(address(this));
}else{
  return aDai.balanceOf(address(this));
}

}

function reBalance( uint256 _aveAPY, uint256 _compAPY ) public {

require(amountDeposited>0);

if((_aveAPY>_compAPY) && (fundsLocation!=address(lending_pool))){
 
        _withdrawComp();
        _moveToAve();
        fundsLocation=address(lending_pool);
    
    
}else if((_compAPY>_aveAPY)&&(fundsLocation!=address(cDai))){
   
        _withdrawAave();
        _moveToComp();
        fundsLocation=address(cDai);
    
}

}

}