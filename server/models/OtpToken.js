const mongoose = require("mongoose");

const otpTokenSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

// TTL index: Delete document when expiresAt is reached
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OtpToken", otpTokenSchema);
