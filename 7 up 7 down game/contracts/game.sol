pragma solidity >=0.4.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract game is VRFConsumerBase{

    uint public randomResult;
    bytes32 internal keyHash;
    uint internal fee;
    address public owner;

    constructor() VRFConsumerBase(0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B,
        0x01BE23585060835E02B77ef475b0Cc51aA1e0709) public
        {
        keyHash=0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
        fee=0.1 *10**18;
        owner=msg.sender;

    }
modifier onlyOwner(){
    require(msg.sender==owner,"Sorry not Owner");
    _;
}
    function getRandomNumber() public returns(bytes32 requestId){
        return requestRandomness(keyHash,fee);
    }

    function fulfillRandomness(bytes32 requestId,uint randomness) internal override{
        randomResult=randomness%7;
    }

    function contractBalance() public view returns(uint){

          
        return address(this).balance;
    }
    function contractFund() external payable{
        require(msg.value> 0.01*(10**18));
    }

    function transfer(address payable reciepient,uint amount) external  onlyOwner{
        reciepient.transfer(amount);
    }
}

