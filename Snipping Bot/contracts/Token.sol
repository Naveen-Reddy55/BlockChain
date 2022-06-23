pragma solidity  >=0.4.22 <0.9.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Cybo is ERC20{

constructor(uint _totalSupply) ERC20("Cybo","CYB"){
_mint(msg.sender, _totalSupply);
}

}