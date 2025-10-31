const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    brandName: { type: String },
    primaryContact: { type: String },

    email: { type: String, required: true, unique: true },
    password: { type: String },

    address: {
      type: String,
    },
    gst: {
      type: String,
    },
    gms: {
      type: Number,
      default: 0,
    },
    country: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
    pincode: {
      type: String,
    },
    state: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "manager", "admin", "supervisor", "dispatch"],
      required: true,
      default: "user",
    },
    amazonManager: {
      type: String,
    },
    websiteManager: {
      type: String,
    },
    etsyManager: {
      type: String,
    },
    uid: { type: Number, unique: true },
    dateAmazon: { type: String },
    dateWebsite: { type: String },
    dateEtsy: { type: String },
    enrollmentIdAmazon: { type: String },
    enrollmentIdWebsite: { type: String },
    enrollmentIdEtsy: { type: String },
    batchAmazon: { type: String },
    batchWebsite: { type: String },
    batchEtsy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
