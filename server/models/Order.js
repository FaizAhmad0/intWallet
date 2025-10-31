const mongoose = require("mongoose");
const { Schema } = mongoose;
const AutoIncrement = require("mongoose-sequence")(mongoose); // import plugin

const orderSchema = new Schema(
  {
    invoice: {
      type: Number,
      unique: true,
    },
    enrollment: {
      type: String,
    },
    brandName: {
      type: String,
    },
    manager: {
      type: String,
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: String,
      required: true,
    },
    shipmentId: {
      type: String,
      required: true,
    },
    trackingId: {
      type: String,
    },
    deliveryPartner: {
      type: String,
    },
    asku: {
      type: String,
    },
    status: {
      type: String,
      required: true,
    },
    finalAmount: {
      type: Number,
    },
    state: {
      type: String,
    },
    add: {
      type: String,
    },
    pincode: {
      type: String,
    },
    gst: {
      type: String,
    },
    items: [
      {
        name: { type: String },
        sku: { type: String },
        price: { type: Number },
        shipping: { type: Number },
        gstRate: { type: Number },
        dimension: { type: String },
        weight: { type: Number },
        hsn: { type: String },
        quantity: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.plugin(AutoIncrement, { inc_field: "invoice", start_seq: 1000 });

module.exports = mongoose.model("Order", orderSchema);
