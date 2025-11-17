const { TYPE_OBJECT, TYPE_STRING } = require("./constants");
const { NullError, InvalidType, EmptyError } = require("./error");

const validatePayload = (payload) => {
  if (!payload) NullError("transaction payload");

  if (typeof payload !== TYPE_OBJECT || Array.isArray(payload)) {
    InvalidType("Transaction payload", TYPE_OBJECT);
  }

  if (Object.keys(payload || {}).length < 1) EmptyError("Transaction payload");
};

const validatePublicKey = (publicKey) => {
  if (!publicKey) NullError("public key");

  if (typeof publicKey !== TYPE_STRING) InvalidType("Public Key", TYPE_STRING);
};

const validatePrivateKey = (privateKey) => {
  if (!privateKey) NullError("private key");

  if (typeof privateKey !== TYPE_STRING) InvalidType("Private Key", TYPE_STRING);
};

const validateMerchantId = (merchantId) => {
  if (!merchantId) NullError("merchant ID");

  if (typeof merchantId !== TYPE_STRING)
    InvalidType("Merchant ID", TYPE_STRING);
};

const validatePublicKeyId = (kid) => {
  if (!kid) NullError("kid");

  if (typeof kid !== TYPE_STRING) InvalidType("public key id", TYPE_STRING);
};

const validatePrivateKeyId = (kid) => {
  if (!kid) NullError("kid");

  if (typeof kid !== TYPE_STRING) InvalidType("private key id", TYPE_STRING);
};

const validateJwsPayload = (payload) => {
  if (!payload) NullError("payload");

  if (typeof payload !== TYPE_STRING) InvalidType("payload", TYPE_STRING);
};

exports.validateGenerateJWEParams = ({ payload, publicKey }) => {
  validatePayload(payload)
  validatePublicKey(publicKey)
};

exports.validateGenerateJWSParams = ({ payload, privateKey }) => {
  validateJwsPayload(payload);
  validatePrivateKey(privateKey);
};

exports.validateMerchantId = () => {
  if (!merchantId) NullError("merchant ID");

  if (typeof merchantId !== TYPE_STRING)
    InvalidType("Merchant ID", TYPE_STRING);
}

exports.validateParams = ({ payload, publicKey, privateKey, merchantId, publicKeyId, privateKeyId }) => {
  validatePayload(payload)
  validatePublicKey(publicKey)
  validateMerchantId(merchantId)
  validatePublicKeyId(publicKeyId)
  validatePrivateKey(privateKey)
  validatePrivateKeyId(privateKeyId)
}