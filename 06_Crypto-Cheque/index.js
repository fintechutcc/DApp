const Web3 = require('web3')
const web3 = new Web3('http://localhost:7545')
const fs = require('fs');

const rawCheque = fs.readFileSync('./build/contracts/Cheque.json')
const parsedCheque = JSON.parse(rawCheque)
const contractAddress = parsedCheque.networks['5777'].address

let signPayment = async (recipient, amount) => {
    const accounts = await web3.eth.getAccounts()
    const payer = accounts[0]
    const txCount = await web3.eth.getTransactionCount(payer)
    const hash = web3.utils.soliditySha3(recipient, amount, txCount, contractAddress)

    try {
        const sigObject = await web3.eth.accounts.sign(hash, '0xdbf978f9c28a0e8048c283d91ec79c6ac12b044c92875d293a6f051cd41e75c1')
        console.log(amount, txCount, sigObject)
    } catch (error) {
        console.log(error)
    }
} 

signPayment('0x2171c9809B1bc5e683f7363459f1fC0A6f9eDD06', 1e18)


