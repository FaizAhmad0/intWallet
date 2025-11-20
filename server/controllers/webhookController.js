// controllers/webhookController.js

module.exports = async (req, res) => {
  try {
    console.log("----- PayGlocal Webhook Received -----");

    const { amount, gid, merchantTxnId, status } = req.body;

    console.log("Extracted Values:");
    console.log("Amount:", amount);
    console.log("GID:", gid);
    console.log("MerchantTxnId:", merchantTxnId);
    console.log("Status:", status);

    return res.status(200).json({
      success: true,
      message: "Webhook received",
      data: { amount, gid, merchantTxnId, status },
    });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
};
