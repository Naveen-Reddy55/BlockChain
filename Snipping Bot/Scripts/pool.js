const Token = artifacts.require("Cybo");
const ERC20 = require("./build/contracts/IERC20.json")
const {ethers,Contract,utils,Wallet}=require("ethers")


uniswap_abi=[
    "function addLiquidity(address tokenA,address tokenB,uint amountADesired,uint amountBDesired,uint amountAMin,uint amountBMin,address to,uint deadline) external virtual override ensure(deadline) returns (uint amountA, uint amountB, uint liquidity)",
    "function swapExactTokensForTokens(uint amountIn,uint amountOutMin,address[] calldata path,address to,uint deadline) external virtual override ensure(deadline) returns (uint[] memory amounts)"
    
]
pooler_private_key="397fd2de95c91bcd7a11dd8c996a9c3eba73fae7ccc019d666fcbf9743d78758"

module.exports=async  function(callback){
const provider =  new ethers.providers.JsonRpcProvider('HTTP://127.0.0.1:7545');

const wallet=new Wallet(pooler_private_key,provider)

const uRouter= new Contract(uniswap_abi,"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
const Weth= new Contract(ERC20.abi,"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2")
let cybo = Token.deployed()
approvable_amount= utils.parseEther("50.0")

const weth_instance= await Weth.connect(wallet)
await weth_instance.approve(uRouter,approvable_amount)

const cybo_instance= await cybo.connect(wallet)
await cybo_instance.approve(uRouter,approvable_amount)



let accounts = await provider.listAccounts()

const pooler=String( accounts[0])
console.log(`Creating Uniswap pool...\n`)


await uRouter.addLiquidity(
    Weth.address,
    cybo.address,
    approvable_amount,
    approvable_amount,
    pooler,
    Math.floor(Date.now() / 1000) + 60 * 10,{from:pooler}
)


console.log(`Pool successfully created!\n`)
callback()
}

