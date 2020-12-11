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