const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OtpToken = require("../models/OtpToken");
const nodemailer = require("nodemailer");

// POST /login
router.post("/", async (req, res) => {
  try {
    console.log("------ callbackurl request ------");
    const xGlToken =
      req.body["x-gl-token"] ||
      req.headers["x-gl-token"] ||
      req.query["x-gl-token"];

    if (!xGlToken) {
      console.error("Missing x-gl-token");
      // return res.redirect(
      //   "http://localhost:8080/#/payment-failure?reason=Missing+payment+token"
      // );
    }

    const parts = xGlToken.split(".");

    const base64urlToBase64 = (str) => {
      const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
      return b64.padEnd(Math.ceil(b64.length / 4) * 4, "=");
    };

    const payloadB64 = base64urlToBase64(parts[1]);
    const payloadJson = Buffer.from(payloadB64, "base64").toString("utf8");
    const decoded = JSON.parse(payloadJson);

    console.log("\n========== decoded response, I am testing  ==========");
    console.log(decoded);
    console.log("====i am testing ====\n");

    if (decoded.status === "SENT_FOR_CAPTURE") {
      const queryParams = new URLSearchParams({
        txnId: decoded.merchantTxnId || "N/A",
        amount: decoded.Amount || decoded.amount || "N/A",
        status: decoded.status,
        gid: decoded.gid || decoded["x-gl-gid"] || "N/A",
        paymentMethod: decoded.paymentMethod || "CARD",
      });
      console.log(
        "Would redirect to success page with:",
        queryParams.toString()
      );
      return res.redirect(`https://wallet.saumiccraft.com/payglocal/callback`);
      // return res.json({ ok: true, payload: decoded, redirectUrl: `http://localhost:8080/#/payment-success?${queryParams.toString()}` });
    } else {
      const reason =
        decoded.failureReason ||
        decoded.message ||
        `Payment status: ${decoded.status}`;
      console.log("Would redirect to failure page with reason:", reason);
      return res.redirect(`https://wallet.saumiccraft.com/payglocal/callback`);
      // return res.json({ ok: false, payload: decoded, redirectUrl: `http://localhost:8080/#/payment-failure?reason=${encodeURIComponent(reason)}&txnId=${decoded.merchantTxnId || 'N/A'}` });
    }
  } catch (err) {
    console.error("Callback error:", err.message);
    return res.redirect(`https://wallet.saumiccraft.com/payglocal/callback`);
    // return res.json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
