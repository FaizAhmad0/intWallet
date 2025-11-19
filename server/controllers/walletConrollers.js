const axios = require("axios");
const User = require("../models/User");
const generate = require("../utils/generateJWEAndJWS");

require("dotenv").config();

exports.addBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // const merchantTxnId = "txn_" + Date.now();

    const payload = {
      merchantTxnId: "23AEE8CB6B62EE2AF07",

      paymentData: {
        totalAmount: "15",

        txnCurrency: "INR",
      },

      merchantCallbackURL: "https://apiwallet.saumiccraft.com/callbackurl",
    };

    const { jweToken, jwsToken } = await generate({
      payload,
      publicKey: process.env.PUBLIC_KEY,
      privateKey: process.env.PRIVATE_KEY,
      merchantId: process.env.MERCHANT_ID,
      publicKeyId: process.env.PUBLIC_KEY_ID,
      privateKeyId: process.env.PRIVATE_KEY_ID,
    });

    const url =
      "https://api.uat.payglocal.in/gl/v1/payments/initiate/paycollect";
    const pgRes = await axios.post(url, jweToken, {
      headers: {
        "Content-Type": "text/plain",
        "x-gl-token-external": jwsToken,
      },
    });

    return res.json({
      paymentURL: pgRes.data.data.redirectUrl || pgRes.data.paymentURL,
      raw: pgRes.data,
      gid: pgRes.data.data.gid,
    });
  } catch (err) {
    console.error("Payglocal Error:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Payglocal request failed",
      details: err.response?.data || err.message,
    });
  }
};
