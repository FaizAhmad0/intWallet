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

      merchantCallbackURL:
        "https://apiwallet.saumiccraft.com/payglocal/callback",
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

    axios.post(
      "https://apiwallet.saumiccraft.com/payglocal/callback",
      async (req, res) => {
        try {
          // PayGlocal sends token in headers
          const token = req.headers["x-gl-token"];

          if (!token) {
            return res.status(400).json({ error: "Missing x-gl-token header" });
          }

          // Decode token → Base64 → JSON
          const decodedString = Buffer.from(token, "base64").toString("utf-8");
          const decodedResponse = JSON.parse(decodedString);

          const status = decodedResponse?.status || decodedResponse?.txnStatus;
          const merchantTxnId = decodedResponse?.merchantTxnId;
          const gid = decodedResponse?.gid;

          if (status === "SENT_FOR_CAPTURE") {
            return res.redirect(
              `https://wallet.saumiccraft.com/payment-status`
            );
          } else {
            return res.redirect(
              `https://wallet.saumiccraft.com/payment-status`
            );
          }
        } catch (error) {
          console.error("Callback error:", error);
          return res.status(500).json({ error: "Callback processing failed" });
        }
      }
    );

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
