const { validateParams } = require("../utils/validate");
const generateJWE = require("./generateJWE");
const generateJWS = require("./generateJWS");

/**
 * Generates a JWE and JWS token required for the initiate request (Encrypt transaction payload)
 *
 * @param {Object} payload Transaction payload with all the required values (required)
 * @param {String} publicKey public key provided by payglocal (required)
 * @param {String} privateKey public key provided by payglocal (required)
 * @param {String} merchantId unique merchantId provided by payglocal (required)
 * @param {String} publicKeyId kid associated with public key (required)
 * @param {String} privateKeyId kid associated with private key (required)
 */
module.exports = async ({ payload, publicKey, privateKey, merchantId, publicKeyId, privateKeyId }) => {
  validateParams({ payload, publicKey, privateKey, merchantId, publicKeyId, privateKeyId })
  const jweToken = await generateJWE({ payload, publicKey, merchantId, publicKeyId });
  const jwsToken = await generateJWS({ payload: jweToken, privateKey, merchantId, privateKeyId })
  return { jweToken, jwsToken };
};
