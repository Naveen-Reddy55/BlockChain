const {ethers,Contract,utils}=require("ethers")
const ERC20 = require("../build/contracts/IERC20.json")


//module.exports = async (callback)=>{

const main=async ()=>{

const trustee_address='0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3'

const amount = utils.parseEther("100.0")



const provider =  new ethers.providers.JsonRpcProvider('HTTP://127.0.0.1:7545');

let accounts = await provider.listAccounts()


const contract = new Contract('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',ERC20.abi,provider.getSigner())


const pooler=String( accounts[0])
const swapper= String( accounts[1])

console.log("Initiating Transaction...")
await contract.transfer(pooler,amount)
console.log("Transaction completed...")
console.log("Initiating Transaction...")
await contract.transfer(swapper,amount)
console.log("Transaction completed...")



const pooler_balance= await contract.balanceOf(pooler)
console.log("Balance of pooler is"+ String(pooler_balance))

const swapper_balance= await contract.balanceOf(swapper)
console.log("Balance of swapper is"+ String(swapper_balance))
}

main();