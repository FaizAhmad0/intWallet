const mongoose = require("mongoose");

const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    enrollmentIdAmazon: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    amount: {
      type: String,
      required: true,
    },
    credit: {
      type: Boolean,
      default: false,
    },
    debit: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
