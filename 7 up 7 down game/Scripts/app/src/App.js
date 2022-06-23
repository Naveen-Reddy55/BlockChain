import './App.css';
import die from "./logo/dice_logo.png"
import dieanime from "./logo/dice.webp"
import eth from "./logo/eth.png"
import diceRoll from "./logo/dice_rolling.gif"
import React, { Component } from 'react'
const {ethers}=require("ethers")
 class App extends Component {
constructor(){
super()
this.state={
  defaultAccount:null,
  provider:null,
  connectState:false,
  ethers:null,
  gameContract:null,
  contractBalance:null,
  userBalance:null,
  Amount:null,
  inputState:true,
  imgState:true,
  instance:null,
  result:null,
  resultState:true
}

this.loadWindow=this.loadWindow.bind(this)
this.BelowSeven=this.BelowSeven.bind(this)
this.AboveSeven=this.AboveSeven.bind(this)
}



async loadWindow(){
if (window.ethereum){
  try{
    const accounts =await window.ethereum.request({method: 'eth_requestAccounts',});
    const contractAbi=[
      "function getRandomNumber() public returns(bytes32 requestId)",
      "function fulfillRandomness(bytes32 requestId,uint randomness) internal override",
      "function contractBalance() public view returns(uint)",
      "function transfer(address payable reciepient,uint amount) external  onlyOwner",
      "function contractFund() external payable"
    ]
    const provider=  new ethers.providers.Web3Provider(window.ethereum,"any")
    const signer = await provider.getSigner()
    const gameContract=new ethers.Contract("0xC8f1D19B1ECD0fF04DA28DAad4c6740Edec179a8",contractAbi,signer)
    const contractBalance = ethers.utils.formatEther((await provider.getBalance(gameContract.address)).toString())+String(" ETH")
    let userBalance = ethers.utils.formatEther((await provider.getBalance(accounts[0]) ).toString())
    userBalance=(+userBalance).toFixed(2) +String(" ETH")
    
    const private_key="PRIVATE_KEY";
    const wallet=new ethers.Wallet(private_key,provider);
    const instance = await gameContract.connect(wallet)

    this.setState({defaultAccount:accounts[0],connectState:true,provider:provider,ethers:ethers,gameContract:gameContract,
    contractBalance:contractBalance,userBalance:userBalance,instance:instance
    });
    
    
  }catch(e){
console.log(e)
  }
  
  window.alert("Wallet Connected..")
}
else{
  window.alert("Metamask Not Found..")
}

}



async BelowSeven(amount){

try{
  const txns=await this.state.gameContract.contractFund({value:this.state.ethers.utils.parseEther(String(this.state.Amount))})
  window.alert("Rolling Dies... This may take a few seconds...")
  this.setState({imgState:false})
  await txns.wait()

}catch(e){
  console.log(e)
  window.alert("Bet Amount should be greater than/Equal 0.01 ETH")
  return
}

const gameContract=this.state.gameContract
let firstDiceNumber =(await gameContract.getRandomNumber())
firstDiceNumber=await gameContract.randomResult
let secondDiceNumber =(await gameContract.getRandomNumber())
secondDiceNumber=await gameContract.randomResult
const result= firstDiceNumber+secondDiceNumber

if(result>=7){
window.alert("Sorry you LOST, Better Luck Next Time...")
this.setState((prev)=>({imgState:!prev.imgState,result:result,resultState:false}))
}else{
  const tx=await this.state.instance.transfer(this.state.defaultAccount,this.state.ethers.utils.parseEther(String(this.state.Amount*2)))
  await tx.wait()
  window.alert("You WIN, Hooray...")
  this.setState((prev)=>({imgState:!prev.imgState,result:result,resultState:false}))

}




}


async AboveSeven(amount){
  try{
    const txns=await this.state.gameContract.contractFund({value:this.state.ethers.utils.parseEther(String(this.state.Amount))})
    window.alert("Rolling Dies... This may take a few seconds...")
    this.setState({imgState:false})
    await txns.wait()
  
  }catch(e){
    console.log(e)
    window.alert("Bet Amount should be greater than/Equal 0.01 ETH")
    return
  }
  
  const gameContract=this.state.gameContract
  let firstDiceNumber =(await gameContract.getRandomNumber())
  firstDiceNumber=await gameContract.randomResult
  let secondDiceNumber =(await gameContract.getRandomNumber())
  secondDiceNumber=await gameContract.randomResult
  const result= firstDiceNumber+secondDiceNumber
  
  if(result<7){
  window.alert("Sorry you LOST, Better Luck Next Time...")
  this.setState((prev)=>({imgState:!prev.imgState,result:result,resultState:false}))
  }else{
    const tx=await this.state.instance.transfer(this.state.defaultAccount,this.state.ethers.utils.parseEther(String(this.state.Amount*2)))
    await tx.wait()
    window.alert("You WIN, Hooray...")
    this.setState((prev)=>({imgState:!prev.imgState,result:result,resultState:false}))
  
  }
  
  
  
  }



  render() {
    return (
      <body>
    <div className="App">
      <nav>
      <img src={die} alt="die" className="die-logo"/>
      <h2>7 Up - 7 Down Game</h2>
      {this.state.resultState?null:<h2 className='result'>Your Dices Sum: {this.state.result}</h2>}
      {this.state.connectState?<h2 className='WalletAddress'>{this.state.defaultAccount}</h2>:<button className='WalletAddress' onClick={this.loadWindow}>Connect Wallet</button>}
      </nav>
      
        <div className="Main">
        <div className="Main-Content">
          <center>
        <img src={this.state.imgState?dieanime:diceRoll} className="Dice-anime"/>
        </center>
        <div className="amount-container">

          <form className='Form'>
          <input type={"number"} placeholder={this.state.inputState?"Bet Amount...":"Rolling..."} className="Amount-input" onChange={(e)=>{this.setState({Amount:e.target.value},()=>{console.log()})}} />
          
          </form>

          <div className='side'>
          <img src={eth} alt="ethereum" className='eth-icon'/>
          <b>ETH</b>
          </div>
          
          </div>
                    <div className="buttons">
                    <button type="submit" className="below-button" onClick={(e)=>{
                      e.preventDefault()

                      const amount = this.state.Amount
                      this.BelowSeven(amount)
                    }}> Below 7</button>
                    <button type="submit" className="above-button" onClick={(e)=>{
                      e.preventDefault()

                      this.AboveSeven()
                    }}> Above 7</button>
                    </div>
          </div>
          <div className='Balance'>
              <h4 >Contract Balance: {this.state.contractBalance} </h4>
              <h4 >User Balance: {this.state.userBalance}</h4>
          </div>
          
        </div>
        
      
    </div>
    
    </body>
    )
  }
}





export default App;
