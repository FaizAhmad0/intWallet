const User = require("../models/User");
const Transaction = require("../models/Transactions");

module.exports = async (req, res) => {
  try {
    console.log("----- PayGlocal Webhook Received -----");

    const { amount, gid, merchantTxnId, status } = req.body;

    console.log("Extracted:", { amount, gid, merchantTxnId, status });

    if (status === "SENT_FOR_CAPTURE") {
      console.log("Processing successful SENT_FOR_CAPTURE payment...");

      const user = await User.findById(merchantTxnId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!user.enrollmentIdAmazon) {
        return res.status(400).json({ error: "Missing enrollmentIdAmazon" });
      }

      const amountNumber = Number(amount);
      user.amount = (user.amount || 0) + amountNumber;
      await user.save();

      console.log("Updated user amount:", user.amount);

      const newTransaction = new Transaction({
        userId: user._id.toString(),
        enrollmentIdAmazon: user.enrollmentIdAmazon,
        amount,
        credit: true,
        debit: false,
        description: "Wallet recharge",
        gid,
      });

      await newTransaction.save();

      console.log("Transaction saved successfully:", newTransaction);
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
};
