const generateJWE = require("./src/generateJWE");
const generateJWS = require("./src/generateJWS");
const generateJWEAndJWS = require("./src/generateJWEAndJWS");
const { validateGenerateJWEParams, validateGenerateJWSParams } = require("./utils/validate");

exports.generateJWE = async params => {
  validateGenerateJWEParams(params);
  return await generateJWE(params);
};

exports.generateJWS = async params => {
  validateGenerateJWSParams(params);
  return await generateJWS(params);
};

exports.generateJWEAndJWS = generateJWEAndJWS;
