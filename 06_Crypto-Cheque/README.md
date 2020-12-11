# คริปโตเช็ค (Crypto Cheque)
## แนวคิด
ต่อไปนี้เป็นตัวอย่างจำลองของคริปโตเช็ค เจ้าของเช็ค (Owner) สามารถเซ็ตผู้รับ (Payee) ซึ่งจำลองโดยใช้ Wallet Address และสามารถเซ็ตจำนวน Ether ที่ต้องการ จากนั้นจำเป็นต้องลงลายมือชื่อ ซึ่งในกรณีตัวอย่างนี้ได้ใช้ ethereum signature กำกับลงไปใน Smart Contract

## Step 1: เตรียมสิ่งแวดล้อม
สร้างไดเร็กทอรี 06_Crypto-Cheque และย้ายไปที่ไดเร็คทอรีที่สร้างด้วยคำสั่งต่อไปนี้
```
mkdir 06_Crypto-Cheque
cd 06_Crypto-Cheque
```

ให้ค่าเริ่มต้นของ Truffle Framework โดยการใช้คำสั่งดังนี้
```
truffle init
```

ติดตั้ง NodeJS Modules ที่สำคัญได้แก่ web3 และ openzeppelin-solidity ด้วยคำสั่งต่อไปนี้

```
npm install web3 openzeppelin-solidity@2.2.0
```

## Step 2: สร้าง Smart Contract
ใช้ Visual Studio Code สร้าง Cheque.sol ลงในไดเร็กทอรี Contracts ดังนี้
```
pragma solidity ^0.5.0;

contract Cheque {
    mapping (uint => bool) usedNonces;
    address owner;

    constructor() public payable {
        owner = msg.sender;
    }

    function splitSignature(bytes memory sig) internal pure returns (uint8, bytes32, bytes32) {
        require (sig.length == 65, "Incorrect signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            //first 32 bytes, after the length prefix
            r := mload(add(sig, 0x20))
            //next 32 bytes
            s := mload(add(sig, 0x40))
            //final byte, first of next 32 bytes
            v := byte(0, mload(add(sig, 0x60)))
        }

        return (v, r, s);
    }
    
    function recoverSigner(bytes32 message, bytes memory sig) internal pure returns (address) {
        uint8 v;
        bytes32 r;
        bytes32 s;

        (v, r, s) = splitSignature(sig);

        return ecrecover(message, v, r, s);
    }
    
    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
    
    function claimPayment(uint amount, uint nonce, bytes memory sig) public returns (bool) {
        uint amountWei = amount * 1e18;
        require(!usedNonces[nonce], "Nonce has already been used");
        usedNonces[nonce] = true;

        bytes32 message = prefixed(keccak256(abi.encodePacked(msg.sender, amountWei, nonce, this)));

        require(recoverSigner(message, sig) == owner, "Signer is not owner");

        msg.sender.transfer(amountWei);

        return true;
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
}
```

## Step 3: Smart Contract Migration
ใช้ Visual Studio Code สร้างไฟล์ 2_deploy_contracts.js ในไดเร็กทอรี migrations ดังนี้

```
var Cheque = artifacts.require("Cheque");

module.exports = function (deployer) {
    deployer.deploy(Cheque, { value: 1e18 });
};
```

เปิดโปรแกรม Ganache เพื่อใช้จำลอง Ethereum Blockchain จากนั้นทำการคอมไพล์และติดตั้ง Smart Contract ลงใน Ganache ด้วยคำสั่ง
```
truffle compile
truffle migrate
```
โปรดสังเกตค่า Ether ที่จ่ายออกไปจาก account แรก

## Step 4: ทำการ Cheque Siging
ปรับเปลี่ยนโค้ดต่อไปนี้ ในส่วน private key ของ accounts[0] ให้เป็นค่า private key ที่ได้จาก account แรกใน Ganache และให้ก็อปปี้ address ของ account ที่สองใน Ganache มาแทนข้อความ address ของ accounts[1]
```
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
        const sigObject = await web3.eth.accounts.sign(hash, 'private key ของ accounts[0]')
        console.log(amount, txCount, sigObject)
    } catch (error) {
        console.log(error)
    }
} 

signPayment('address ของ accounts[1]', 1e18)
```


รันโค้ดต่อไปนี้ เพื่อลงลายมือชื่อลงใน Cheque Smart Contract
```
node index.js
```

โปรดสังเกตผลลัพธ์ที่ได้ เช่น ค่า value, txCount, message, messageHash และก็อปปี้ signature เอาไว้ใช้ในขั้นตอนต่อไป

## Step 5: การรับเช็คโดย accounts[1]
ที่ไดเร็กทอรีหลักของโปรเจ็คนี้ (เช่น 06_Crypto-Cheque) เปิดใช้งาน console ของ truffle เพื่อโต้ตอบกับ Smart Contract โดยใช้คำสั่งต่อไปนี้
```
truffle console
```

เมื่อเปิด console แล้ว สามารถใช้คำสั่งของ Javascript ดังนี้
```
let app
Cheque.deployed().then((instance) => {app = instance})
let accounts
web3.eth.getAccounts().then((result) => {accounts = result})
```
ลองตรวจสอบดูว่าสามารถอ่านค่า Address ของบัญชีต่าง ๆ ใน Ganache ได้โดยใช้คำสั่ง

```
accounts
```

กำหนดค่า txCount และ sig ตามที่ได้จากขั้นตอนที่ 4

```
let txCount = ...
let sig = '...'
```

ทำการรับเช็คให้กับ accounts[1] ได้โดยใช้คำสั่งดังนี้

```
app.claimPayment(1, txCount, sig, {from: accounts[1]})
```

สังเกตผลลัพธ์ที่ได้ โดยเฉพาะค่า Eth ใน accounts[1] ของ Ganache

