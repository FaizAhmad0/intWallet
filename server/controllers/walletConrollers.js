const axios = require("axios");
const User = require("../models/User");
const generate = require("../utils/generateJWEAndJWS");

require("dotenv").config();

exports.addBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    console.log(user);
    if (!user) return res.status(404).json({ error: "User not found" });

    // const merchantTxnId = "txn_" + Date.now();

    const payload = {
      merchantUniqueId: `${user.uid}`,

      paymentData: {
        totalAmount: `${amount}`,

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
    });
  } catch (err) {
    console.error("Payglocal Error:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Payglocal request failed",
      details: err.response?.data || err.message,
    });
  }
};

exports.verifyBalance = async (req, res) => {
  try {
    const { gid, enrollment } = req.body;

    if (!gid) {
      return res.status(400).json({ error: "GID is required" });
    }

    console.log("Received GID:", gid);
    console.log("Received enrollment:", enrollment);

    // Dynamically create payload for signature
    const payloadStatus = `/gl/v1/payments/${gid}/status`;

    const { jwsTokenStatus } = await generate({
      payloadStatus,
      publicKey: process.env.PUBLIC_KEY,
      privateKey: process.env.PRIVATE_KEY,
      merchantId: process.env.MERCHANT_ID,
      publicKeyId: process.env.PUBLIC_KEY_ID,
      privateKeyId: process.env.PRIVATE_KEY_ID,
    });
    // Payglocal Status URL (Dynamic)
    const url = `https://api.uat.payglocal.in/gl/v1/payments/${gid}/status`;

    const pgRes = await axios.get(url, {
      headers: {
        "x-gl-token-external": jwsTokenStatus,
      },
    });

    console.log("Payglocal Status Response:", pgRes.data);

    // Response to Frontend
    return res.json({
      success: true,
      message: "Status Fetched",
      gid,
      enrollment,
      payglocalStatus: pgRes.data,
    });
  } catch (err) {
    console.error("Payglocal Error:", err.response?.data || err.message);

    return res.status(500).json({
      success: false,
      error: "Payglocal request failed",
      details: err.response?.data || err.message,
    });
  }
};
