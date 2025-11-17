const { CompactEncrypt, importSPKI } = require("jose");
const { JWE_ALGORITHM } = require("../utils/constants");
const { generateJWEHeaderObject } = require("../utils/helper");

/**
 * Generates a JWE token (Encrypt transaction payload)
 *
 * @param {Object} payload Transaction payload with all the required values (required)
 * @param {String} publicKey public key provided by payglocal (required)
 * @param {String} merchantId unique merchantId provided by payglocal
 * @param {String} publicKeyId kid associated with payglocal public key
 */
module.exports = async ({ payload, publicKey, merchantId, publicKeyId }) => {
  const cryptoPublicKey = await importSPKI(publicKey, JWE_ALGORITHM);
  const headerObject = generateJWEHeaderObject({ merchantId, kid: publicKeyId });

  const jwe = await new CompactEncrypt(
    new TextEncoder().encode(JSON.stringify(payload))
  )
    .setProtectedHeader(headerObject)
    .encrypt(cryptoPublicKey);

  return jwe;
};
