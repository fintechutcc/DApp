# Digital signature from javascript crypto

This repository contains code sample of nodejs crypo built in library for digital signature of document signing

Read more details of javascript cypto library [here](https://nodejs.org/api/crypto.html)


## Plaform dependencies
- NodeJs >= v10.15

## Files and directories
- `./keys`  - Directory contains sample public and private key.You MUST generate your own key for real usage.Refer keys/README.md for how to generate your own keys 
- `signature.txt` - sign.js will write generated signature on this file.It will be overritten each time you run sign.js
- `sample-doc.txt` - This is a sample document to be signed.You can use any document type for this.Just change the document path of sign.js and verify.js files accordingly.
- `sign.js` - Code script to generate digital signature
- `verify.js` - Code script to verify generated gidital signature

## Usage

### Generate the signature by using keys/privateKey.pem for the document sample-doc.txt
```
node sign.js
```
### Verify the signature generated from above step(stored in signature.txt)
```
node verify.js
```

## Generating QR Code for signature.txt

Javascript library [`qrcode`](https://www.npmjs.com/package/qrcode) has been used to generate the qr code.

```
// Install library dependancy
yarn install
node QRcode.js
```
QR code will be saved in  `qr.html` file.Open this file from a web brower to see the QR code.

## Special Notes for Ubuntu
### 1. Create private/public key pair
```
openssl genrsa -out private.pem 4096
```

### 2. Extrac public key
```
openssl rsa -in private.pem -out public.pem -outform PEM -pubout
```

### 3. Sign
```
openssl dgst -sha256 -sign private.pem -out SLA.txt.sha256 SLA.txt
```

### 4. Verify
```
openssl dgst -sha256 -verify public.pem -signature SLA.txt.sha256 SLA.txt
```


