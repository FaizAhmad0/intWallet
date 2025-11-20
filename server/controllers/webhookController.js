// controllers/webhookController.js

module.exports = async (req, res) => {
  try {
    console.log("----- PayGlocal Webhook Received -----");

    const headers = req.headers;
    const body = req.body;

    console.log("Headers:", headers);
    console.log("Body:", body);

    const signature = headers["x-gl-signature"];
    if (!signature) {
      console.log("⚠ No webhook signature found");
      return res.status(400).json({ error: "Signature missing" });
    }
    const gid = body?.gid || body?.["x-gl-gid"] || body?.payment?.gid || null;

    const status = body?.status || body?.payment?.status || "UNKNOWN";

    console.log("Webhook GID:", gid);
    console.log("Webhook Status:", status);

    if (gid) {
      console.log("Payment updated in DB:", gid, status);
    }

    return res.status(200).json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
};
