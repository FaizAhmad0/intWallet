const Instamojo = require("instamojo-nodejs");
const axios = require("axios");
const User = require("../models/User");
const Transaction = require("../models/Transactions");
const dotenv = require("dotenv");

dotenv.config();

const INSTAMOJO_API_KEY = process.env.INSTAMOJO_API_KEY;
const INSTAMOJO_AUTH_TOKEN = process.env.INSTAMOJO_AUTH_TOKEN;
const INSTAMOJO_URL =
  process.env.NODE_ENV === "production"
    ? "https://www.instamojo.com/api/1.1"
    : "https://test.instamojo.com/api/1.1";

// Init Instamojo
Instamojo.setKeys(INSTAMOJO_API_KEY, INSTAMOJO_AUTH_TOKEN);
Instamojo.isSandboxMode(process.env.NODE_ENV !== "production");

// Add Balance
const addBalance = async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const response = await axios.post(
      `${INSTAMOJO_URL}/payment-requests/`,
      {
        purpose: "Add Balance",
        amount: amount,
        buyer_name: user.name,
        email: user.email,
        phone: user.primaryContact,
        redirect_url:
          process.env.NODE_ENV === "production"
            ? "https://wallet.saumiccraft.in/payment-status"
            : "http://localhost:3000/payment-status",
      },
      {
        headers: {
          "X-Api-Key": INSTAMOJO_API_KEY,
          "X-Auth-Token": INSTAMOJO_AUTH_TOKEN,
        },
      }
    );

    return res.status(200).json({
      paymentURL: response.data.payment_request.longurl,
    });
  } catch (error) {
    console.error("Add Balance Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to create payment request" });
  }
};

// Verify Payment
const verifyBalance = async (req, res) => {
  const { paymentRequestId, paymentId } = req.body;
  const userId = req.user.id;

  try {
    // Check if transaction already exists
    const existing = await Transaction.findOne({ paymentId });
    if (existing) {
      return res
        .status(200)
        .json({ success: true, message: "Already verified" });
    }

    const response = await axios.get(
      `${INSTAMOJO_URL}/payment-requests/${paymentRequestId}`,
      {
        headers: {
          "X-Api-Key": INSTAMOJO_API_KEY,
          "X-Auth-Token": INSTAMOJO_AUTH_TOKEN,
        },
      }
    );

    const payment = response.data.payment_request.payments.find(
      (p) => p.payment_id === paymentId
    );

    if (payment && payment.status === "Credit") {
      const amount = Number(response.data.payment_request.amount);

      const user = await User.findById(userId);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      user.amount += amount;
      await user.save();

      const newTransaction = new Transaction({
        email:user.email,
        userId,
        enrollmentIdAmazon: user.enrollmentIdAmazon || "N/A",
        amount: amount.toFixed(2),
        credit: true,
        description: "Added Balance",
        paymentId,
      });

      await newTransaction.save();

      return res.status(200).json({
        success: true,
        message: "Balance added and transaction saved",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Payment not credited" });
    }
  } catch (error) {
    console.error(
      "Verify Payment Error:",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  addBalance,
  verifyBalance,
};
