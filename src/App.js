import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers'
import BountyFactory from './artifacts/contracts/BountyFactory.sol/BountyFactory.json'
import Bounty from './artifacts/contracts/Bounty.sol/Bounty.json'

// Update with the contract address logged out to the CLI when it was deployed 
const bountyFactoryAddress = "0x06783aE8EF55191730244984CA2FDAEd197ebCc0"

function App() {
  // store greeting in local state
  const [bountyAddress, setBountyAddress] = useState("")

  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  // call the smart contract, read the current greeting value
  async function deployContract() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(bountyFactoryAddress, BountyFactory.abi, signer)

      contract.on("BountyCreated", (address) => {
        console.log("Bounty created", address)
        setBountyAddress(address)
      })

      try {
        const expiry = new Date().getTime() + 1000
        const overrides = {
          value: ethers.utils.parseEther("0.1")     // ether in this case MUST be a string
        };
        const qq = await contract.createBounty(expiry, overrides);
        console.log('data: ', qq)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  async function completeBounty() {
    if (typeof window.ethereum !== 'undefined' && bountyAddress !== "") {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(bountyAddress, Bounty.abi, signer)

      const hunter = "0xfC00F00a77e6341832533A72fa2Ed4245cBD2bf3"

      contract.on("BountyCompleted", (address, balance) => {
        console.log("Bounty completed", address, balance)
      })

      try{
        const qq = await contract.payoutBounty(hunter);
        console.log('data: ', qq)
      }catch (err){
        console.log("Error: ", err)
      }
    }
  }

  // // call the smart contract, send an update
  // async function setGreeting() {
  //   if (!greeting) return
  //   if (typeof window.ethereum !== 'undefined') {
  //     await requestAccount()
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);

  //     const transaction = await contract.setGreeting(greeting)
  //     await transaction.wait()
  //     fetchGreeting()
  //   }
  // }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={deployContract}>Deploy bounty contract</button>
        <h2>Bounty address: {bountyAddress}</h2>
        <button onClick={completeBounty}>Complete bounty</button>
      </header>
    </div>
  );
}

export default App;