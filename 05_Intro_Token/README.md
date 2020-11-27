# การสร้าง ERC20 Token อย่างง่าย

## ขั้นตอนที่ 1 
สร้างไดเร็กทอรีเพื่อใช้บันทึกงาน

```
mkdir tutorialtoken
cd tutorialtoken
```

ดาวน์โหลด tutorialtoken จาก Truffle Suite

```
truffle unbox tutorialtoken
```

ติดตั้งแพ็กเกจ OpenZeppelin โดยเลือกเวอร์ชัน 2.2.0 เพื่อให้ใช้ Solidity เวอร์ชัน 0.5.0 ขึ้นไปได้

```
npm install openzeppelin-solidity@2.2.0
```

## ขั้นตอนที่ 2
สร้างไฟล์ Smart Contract ชื่อ TutorialToken.sol ในไดเร็กทอรี contracts

```
pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract TutorialToken is ERC20 {
    string public name = "TutorialToken";
    string public symbol = "TT";
    uint8 public decimals = 2;
    uint public INITIAL_SUPPLY = 12000;

    constructor() public {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}
```

สร้างไฟล์ 2_deploy_contracts.js ในไดเร็กทอรี migrations

```
var TutorialToken = artifacts.require("TutorialToken");

module.exports = function(deployer) {
  deployer.deploy(TutorialToken);
};
```

ทำการคอมไพล์และย้าย TutorialToken ไปยัง Ganache (Private Blockchain)
```
truffle compile
truffle migrate
```

## ขั้นตอนที่ 3
เปิดไฟล์ app.js เพื่อแก้ไขดังนี้

ในฟังก์ชัน initWeb3 ให้คอมเมนต์บรรทัดที่ 11 ถึง 18 และเติมคำสั่งเพิ่มเติม 2 บรรทัดก่อน return App.initContract(); ดังนี้

```
App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
web3 = new Web3(App.web3Provider);
```

เปิดโปรแกรม Ganache แล้วรันโปรเจ็คโดยใช้คำสั่ง
```
npm run dev
```

บราวเซอร์จะเปิดขึ้นโดยอัตโนมัติ หรือสามารถเปิดบราวเซอร์ที่ URL ดังนี้ http://localhost:3000

การทดสอบการโอน TutorialToken ทำได้โดยก็อปปี้ Address ของบัญชีอื่นเช่น บัญชีลำดับที่ 3 จาก Ganache แล้วนำวางลงบนช่อง Address ในเว็บบราวเซอร์ ป้อนจำนวน TutorialToken ที่ต้องการโอน แล้วคลิก Transfer สังเกตผลลัพธ์ที่ได้