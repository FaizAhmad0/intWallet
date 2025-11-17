# payglocal-js-client

Helper function to encrypt your data and create a JWE and JWS token which can be used in making the api call

## Installation

you can install this in your node project using following command

```
npm install github:PayGlocal-Technologies/payglocal-js-client
```

## Get Started

#### Generate JWE and JWS token

```
const { generateJWEAndJWS } = require('payglocal-js-client');

const data = {
  payload, // transaction payload in proper format refer to our integration guide (required)
  publicKey, // PayGlocal public key (downloaded from gcc) (required)
  privateKey, // private key (generated and downloaded from gcc) (required)
  merchantId, // unique merchant id (provided by PayGlocal) (required)
  privateKeyId, // kid for private key (required)
  publicKeyId // kid for public key (required)
};

generateJWEAndJWS(data).then((res) => {
  console.log(res);
});

// above function returns a promise which resolved to
// { jweToken, jwsToken };
```

#### Encrypt data using JWE (generate JWE token)

this is an additional function which is exposed if you want to encrypt your data using any public key for your own use.

*Note:- this won't be required to generate a transaction*

```
const { generateJWE } = require('payglocal-js-client');

const data = {
  payload, // stringified payload or a token (encrypted data) (required)
  publicKey, // public key with which the payload hash has to be signed (required)
  publicKeyId, // kid associated with public key (optional)
};

generateJWE(data).then((res) => {
  console.log(res);
});

// above function will return a promise which will resolve to JWE token sting
```

### create an hash of the token and sign it using JWS (generate JWS token)

this is an additional function exposed if you would like to sigh your encrypted data or if you want to create a digest of your payload and create a JWS token

*Note:- this won't be required to generate a transaction*

```
const { generateJWS } = require('payglocal-js-client');

const data = {
  payload, // stringified payload or a token (encrypted data) (required)
  privateKey, // private key with which the payload hash has to be signed (required)
  privateKeyId, // kid associated with private key (optional)
};

generateJWS(data).then((res) => {
  console.log(res);
});

// above function will return a promise which will resolve to JWS token
```
