const IUniswapV2Factory= require(".\node_modules\@uniswap\v2-core\build\IUniswapV2Factory.json");
const IUniswapV2Pair= require("@uniswap/v2-core/build/IUniswapV2Pair.json")
const IUniswapV2Router02 = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json')
const ERC20 = require("./build/contracts/IERC20.json")
const {ethers,utils,Contract}=require("ethers")

const uFactoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
const uRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const IUniswapV2Factory_contract= new Contract(IUniswapV2Factory.abi,uFactoryAddress)
const IUniswapV2Router02_contract=new Contract(IUniswapV2Router02.abi,uRouterAddress)
const Weth = new Contract(ERC20.abi,"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2")

const provider =  new ethers.providers.JsonRpcProvider('HTTP://127.0.0.1:7545');

let accounts = await provider.listAccounts()


const swapper = accounts[1];

const main=async ()=>{

IUniswapV2Factory_contract.events.PairCreated({},async(error,events)=>{

const {token0,token1,pair}=events.returnValues

const pair_contract= new Contract(IUniswapV2Pair.abi,pair)

const Amount= utils.parseEther("10")

let order =[];

if(token0==Weth.address){
    order=[token0,token1]
}
if(token1==Weth.address){
    order=[token1,token0]
}
if(order.length==0){
    console.log("Pair haven't created...")

}

const AMOUNT = '0.25' // How much WETH are you willing to spend on new tokens?
const SLIPPAGE = 0.05


Cybo_address=order[1];
const Cybo_contract= new Contract(ERC20.abi,Cybo_address)

const reserves = await pair_contract.getReserves()

console.log("Checking for liquidity...")

if(reserves[0]==0 && reserves[1]==0 ){
    console.log("There is no liquidity...")

}else{
    console.log("Swapping with Weth...\n")

    try{
        const amountIn=ethers.BigNumber.from(Amount)
        const amounts= await IUniswapV2Router02_contract.getAmountsOut(amountIn,order)
        const amountOut = String(amounts[1] - (amounts[1] * SLIPPAGE))
        const deadline = Date.now() + 1000 * 60 * 10
        await Weth.approve(uRouterAddress,amountIn,{from:swapper})
        const gas = await uRouter.swapExactTokensForTokens(amountIn, amountOut, order, swapper, deadline,{from:swapper}).estimateGas()
        await uRouter.swapExactTokensForTokens(amountIn,amountOut,order,swapper,deadline,{from:swapper,gas:gas})

        console.log("Swap Successful \n")

        const tokenBalance= Cybo_contract.balanceOf(swapper)

        console.log(`Successfully swapped ${Amount} WETH for ${ethers.parseEther(tokenBalance.toString())}`)
    } catch (error){
            console.log(`Error Occured while swapping...`)
            console.log(`You may need to adjust slippage, or amountIn.\n`)
            console.log(error)
    }

    console.log(`Listening for new pairs...\n`)

}

})

console.log("Listening for new pairs...")

}


main()