// const axios = require("axios");
// const User = require("../models/User");
// const generate = require("../utils/generateJWEAndJWS");

// require("dotenv").config();

// exports.StatusCheck = async (req, res) => {
//   try {
//     const { amount } = req.body;
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     // const merchantTxnId = "txn_" + Date.now();

//     // const payload = {
//     //   merchantTxnId: "23AEE8CB6B62EE2AF07",

//     //   paymentData: {
//     //     totalAmount: "15",

//     //     txnCurrency: "INR",
//     //   },

//     //   merchantCallbackURL: "https://apiwallet.saumiccraft.com/callbackurl",
//     // };

//     // const { jweToken, jwsToken } = await generate({
//     //   payload,
//     //   publicKey: process.env.PUBLIC_KEY,
//     //   privateKey: process.env.PRIVATE_KEY,
//     //   merchantId: process.env.MERCHANT_ID,
//     //   publicKeyId: process.env.PUBLIC_KEY_ID,
//     //   privateKeyId: process.env.PRIVATE_KEY_ID,
//     // });

//     const payloadStatus = `/gl/v1/payments/gl_o-9a0debc1d7413e2d2xbct0vX2/status`;

//     const { jwsTokenStatus } = await generate({
//       payloadStatus,
//       publicKey: process.env.PUBLIC_KEY,
//       privateKey: process.env.PRIVATE_KEY,
//       merchantId: process.env.MERCHANT_ID,
//       publicKeyId: process.env.PUBLIC_KEY_ID,
//       privateKeyId: process.env.PRIVATE_KEY_ID,
//     });

//     // https://api.uat.payglocal.in/gl/v1/payments/gl_o-9a0debc1d7413e2d2xbct0vX2/status

//     const url =
//       "https://api.uat.payglocal.in/gl/v1/payments/gl_o-9a0debc1d7413e2d2xbct0vX2/status";
//     const pgRes = await axios.get(url, jweToken, {
//       headers: {
//         "x-gl-token-external": jwsTokenStatus,
//       },
//     });

//     console.log(pgRes);

//     return res.json({
//       paymentURL: pgRes.data.data.redirectUrl || pgRes.data.paymentURL,
//       raw: pgRes.data,
//     });
//   } catch (err) {
//     console.error("Payglocal Error:", err.response?.data || err.message);
//     return res.status(500).json({
//       error: "Payglocal request failed",
//       details: err.response?.data || err.message,
//     });
//   }
// };
