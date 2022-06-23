import logo from './logo.svg';
import './App.css';
import bodyImage from "./main-image.png";
import React, { Component } from 'react'
import{getCompoundAPY,getAaveAPY} from "./helper/APYcalc"
const {ethers,Contract,providers}=require("ethers")

class App extends Component {

constructor(){
  super()
  this.state={
    defaultAccount:null,
    addressClick:true,
    aggregatContract:null,
    daiContract:null,
    cDaiContract:null,
    AaveLendingPoolContract:null,
    ethers:null,
    walletBalance:"5",
    aggregatorBalance:null,
    location:null,
    dai_address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    cDAI_address: "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
    aaveLendingPool_address: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
    amountToDeposit:"0",

  }

this.depositHandler=this.depositHandler.bind(this);
this.RebalanceHandler=this.RebalanceHandler.bind(this);
this.WithdrawHandler=this.WithdrawHandler.bind(this)
}


componentWillMount() {
  this.loadWindow()
}

async loadWindow(){
  if(window.ethereum){

    const result = await window.ethereum.request({ method: 'eth_requestAccounts' })
    this.setState({ defaultAccount: result[0], addressClick: false, ethers: ethers })

    
    window.alert("Wallet Connected")
    await this.loadWeb3Data()

  }else{
    window.alert("No ethereum account detected...")
  }
}



async loadWeb3Data(){

  const AggregatorAbi=[
    "function deposit(uint256 fund, uint256 _aveAPY, uint256 _compAPY) public",
    "function Withdraw() public onlyOwner",
    "function whereBalance() public view returns(address)",
    "function ContractBalance() public view returns(uint256)",
    "function reBalance( uint256 _aveAPY, uint256 _compAPY ) public onlyOwner"
  ]
  const daiAbi=[
    "function approve(address usr, uint wad) external returns (bool)",
    " function transfer(address dst, uint wad) external returns (bool)",
    "function transferFrom(address src, address dst, uint wad) public returns (bool)",
    "function balanceOf(address) external view returns (uint256)"
  ]

  const cDaiAbi=[
    "function mint(uint256) external returns (uint256)",
    "function redeem(uint256) external returns (uint256)",
    "function supplyRatePerBlock() external returns (uint256)",
    " function balanceOf(address) external view returns (uint256)"
  ]
  const AaveLendingPoolAbi=[

    "function deposit(address asset,uint256 amount,address onBehalfOf,uint16 referralCode) external",
    "function withdraw(address asset,uint256 amount,address to) external"
  ]

  
 const provider=new providers.Web3Provider(window.ethereum)
  //const aggregatContract = await Contract("0x42b71288FE55B1a3857Ecc1B28614Cf56272aDE7",AggregatorAbi);
  //this.setState({aggregatContract});
  const daiContract=new Contract("0x6B175474E89094C44Da98b954EedeAC495271d0F",daiAbi,provider);

   this.setState({daiContract:daiContract})

  const cDaiContract= new Contract("0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",cDaiAbi,provider)
   this.setState({cDaiContract:cDaiContract})

  const AaveLendingPoolContract=new Contract("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",AaveLendingPoolAbi,provider)
   this.setState({AaveLendingPoolContract:AaveLendingPoolContract})

await this.fetchAccountInfo()

}


async fetchAccountInfo(){

  let walletBalance=await this.state.daiContract.balanceOf(this.state.defaultAccount)

window.alert("stop")
  let aggregatorBalance =await this.state.aggregatContract.amountDeposited()

    walletBalance = this.state.ethers.utils.formatEther(walletBalance, 'ether')
		aggregatorBalance = this.state.ethers.utils.formatEther(aggregatorBalance, 'ether')

    this.setState({walletBalance:walletBalance});
    this.setState({aggregatorBalance:aggregatorBalance});

    const activelocation= this.state.aggregatContract.balanceWhere();
    activelocation===this.state.aaveLendingPool_address? this.setState({location:"Aave lending platform"}):this.setState({location:"Compound Platform"});
    
}

async depositHandler(){

  if(this.state.walletBalance==="0"){
    window.alert("No funds in wallet")
    return
  }

  if (Number(this.state.amountToDeposit) > Number(this.state.walletBalance)) {
    window.alert('Insufficient funds')
    return
}

if (this.state.amountToDeposit <= 0) {
  window.alert('Cannot be 0 or negative')
  return
}

const amount= this.state.ethers.formatEther(this.state.amountToDeposit.toString())
const compAPY = await getCompoundAPY(this.state.cDaiContract)
		const aaveAPY = await getAaveAPY(this.state.AaveLendingPoolContract)
await this.state.daiContract.approve(this.aggregatContract,amount,{from:this.state.defaultAccount})
await this.state.aggregatContract.deposit(amount,compAPY,aaveAPY,{from:this.state.defaultAccount})

}

async RebalanceHandler(){
  if(this.state.aggregatorBalance==="0"){
    window.alert("No funds in contract")
    return
  }


  const compAPY = await getCompoundAPY(this.state.cDaiContract)
  const aaveAPY = await getAaveAPY(this.state.AaveLendingPoolContract)

  if((compAPY>aaveAPY)&&(this.state.location==="Compound Platform" )){
    window.alert("funds are already in highest possible APY platform")
  }
  if ((aaveAPY>compAPY)&&(this.state.location==="Aave lending platform")){
    window.alert("funds are already in highest possible APY platform")
  }

  this.state.AaveLendingPoolContract.rebalance(aaveAPY,compAPY,{from:this.state.defaultAccount})


  }


  async WithdrawHandler(){


    if (this.state.aggregatorBalance === "0") {
			window.alert('No funds in contract')
			return
		}
    this.state.aggregatContract.Withdraw({from:this.state.defaultAccount})


  }



  render() {
    return (
      <div className="App" >

     <div className="Navbar">
       <h4 className='Text'>Aggregator Rebalancer</h4>
        <div  className="Address">
        {this.state.addressClick?<button type="button" className='Connect'>Connect Wallet</button>:<h4>{this.state.defaultAccount}</h4>}
        </div>
     </div>

     <div className='Body-component'>
     <div className="Heading">
      <h1>Funds Rebalancer</h1>
     </div>

     <center><img className='Diag' src={bodyImage} alt="blockchain" /></center>

     <div className="InputData">
     <form className='Data' onSubmit={(e) => {
									e.preventDefault()
								}}>
									<input type="number" placeholder="Amount" onChange={(e)=>{this.setState({amountToDeposit:e.target.value})}}/>
									<button type="submit" className="Button" onClick={this.depositHandler}>Deposit</button>
                  <button type="submit" className="Button" onClick={this.RebalanceHandler}>Rebalance</button>
                  <button type="submit" className="Button" onClick={this.WithdrawHandler}>Withdraw</button>
								</form>
     </div>
     <div className="Text">

     </div>
    </div>
    </div>
    )
  }
}



export default App;
