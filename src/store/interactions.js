import EthStakingPool from '../backEnd/abis/EthStakingPool.json'
import Web3 from 'web3'
import {
  web3Loaded,
  contractLoaded,
  web3NetworkLoaded,
  web3AccountLoaded,
  web3BalanceLoaded,
  contractBalance,
  stakeAmount
} from './actions'

export const loadWeb3 = async (dispatch) => {
  try{
    if(typeof window.ethereum!=='undefined'){
      window.ethereum.autoRefreshOnNetworkChange = false;
      const web3 = new Web3(window.ethereum)
      dispatch(web3Loaded(web3))
      return web3
    }
  } catch (e) {
    console.log('Error, load Web3: ', e)
  }
}

export const loadNetwork = async (dispatch, web3) => {
  try{
    let network = await web3.eth.net.getNetworkType()
    network = network.charAt(0).toUpperCase()+network.slice(1)
    dispatch(web3NetworkLoaded(network))
    return network
  } catch (e) {
    dispatch(web3NetworkLoaded('Wrong network'))
    console.log('Error, load network: ', e)
  }
}

export const loadAccount = async (dispatch, web3) => {
  try{
    const accounts = await web3.eth.getAccounts()
    const account = await accounts[0]
    if(typeof account !== 'undefined'){
      dispatch(web3AccountLoaded(account))
      return account
    } else {
      dispatch(web3AccountLoaded(null))
      return null
    }
  } catch (e) {
    console.log('Error, load account: ', e)
  }
}

export const loadBalance = async (dispatch, web3, account) => {
  try {
    // Ether balance in wallet
    const etherBalance = await web3.eth.getBalance(account)
    dispatch(web3BalanceLoaded((etherBalance/10**18).toFixed(5)))
  } catch (e) {
    console.log('Error, load balance: ', e)
  }
}

export const loadContract = async (dispatch, web3, netId) => {
  try {
    const contractABI = [{"inputs": [],"stateMutability": "nonpayable","type": "constructor"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "address","name": "account","type": "address"},{"indexed": false,"internalType": "uint256","name": "amount","type": "uint256"}],"name": "Claim","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "bytes","name": "pubkey","type": "bytes"},{"indexed": false,"internalType": "bytes","name": "withdrawal_credentials","type": "bytes"},{"indexed": false,"internalType": "bytes","name": "signature","type": "bytes"},{"indexed": false,"internalType": "bytes32","name": "deposit_data_root","type": "bytes32"},{"indexed": false,"internalType": "uint256","name": "timestamp","type": "uint256"}],"name": "Deposit","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "address","name": "account","type": "address"},{"indexed": false,"internalType": "uint256","name": "amount","type": "uint256"}],"name": "EthReceived","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "address","name": "account","type": "address"},{"indexed": false,"internalType": "uint256","name": "timestamp","type": "uint256"}],"name": "Finalize","type": "event"},{"inputs": [],"name": "DEPOSIT_AMOUNT","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "NAME","outputs": [{"internalType": "string","name": "","type": "string"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "address","name": "","type": "address"}],"name": "balances","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "claim","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [],"name": "deadline","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "bytes","name": "pubkey","type": "bytes"},{"internalType": "bytes","name": "withdrawal_credentials","type": "bytes"},{"internalType": "bytes","name": "signature","type": "bytes"},{"internalType": "bytes32","name": "deposit_data_root","type": "bytes32"}],"name": "deposit","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [],"name": "finalize","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [],"name": "finalized","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "address","name": "","type": "address"}],"name": "hasClaimed","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "bytes","name": "","type": "bytes"}],"name": "hasDeposited","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "owner","outputs": [{"internalType": "address payable","name": "","type": "address"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "weiLeftover","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "weiRaised","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"stateMutability": "payable","type": "receive"}]
    const contractAddress = '0x03AF72FBD63E1009D312ED63D377115912d1dc8b'
    const contract = new web3.eth.Contract(contractABI, contractAddress)
    //const contract = new web3.eth.Contract(EthStakingPool.abi, EthStakingPool.networks[netId].address)
    dispatch(contractLoaded(contract))
    return contract
  } catch (e) {
    console.log('Error, load contract: ', e)
    window.alert('Error, contract is deployed to the current network!')
  }
}

export const update = async (dispatch) => {
  try{
    let account, web3, network, netId, contract, contractBalance

    web3 = await loadWeb3(dispatch)
    account = await loadAccount(dispatch, web3)
    network = await loadNetwork(dispatch, web3)
  
    netId = await web3.eth.net.getId()
    contract = await loadContract(dispatch, web3, netId)
    contractBalance = await loadContractBalance(dispatch, web3, contract)
  
    if(account && contract){
      await loadBalance(dispatch, web3, account)
    } else {
      console.log('Something wrong with either contract or account')
    }
  } catch (e) {
    console.log('Error, update data: ', e)
  }
}

export const deposit = async (dispatch, amount) => {
  try{
    let account, web3, netId, contract

    web3 = await loadWeb3(dispatch)
    netId = await web3.eth.net.getId()
    account = await loadAccount(dispatch, web3)
    contract = await loadContract(dispatch, web3, netId)

    await web3.eth.sendTransaction({from: account, to: contract.options.address, value: amount})
    .on('transactionHash', async (hash) => {
      await update(dispatch)
      await dispatch(stakeAmount(null))
    })
  } catch (e) {
    console.log('Error, deposit', e)
    await dispatch(stakeAmount(null))
  }
}

export const loadContractBalance = async (dispatch, web3, contract) => {
  const balance = await web3.eth.getBalance(contract.options.address)

  dispatch(contractBalance(balance))

  return balance
}