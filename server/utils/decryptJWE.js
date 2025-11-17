const { importPKCS8, compactDecrypt } = require("jose");

module.exports = async (jweToken, privateKey) => {
  const cryptoPrivKey = await importPKCS8(privateKey, "RSA-OAEP-256");
  const { plaintext } = await compactDecrypt(jweToken, cryptoPrivKey);
  return JSON.parse(new TextDecoder().decode(plaintext));
};
