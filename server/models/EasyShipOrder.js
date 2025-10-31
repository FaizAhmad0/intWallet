const mongoose = require("mongoose");
const { Schema } = mongoose;
const AutoIncrement = require("mongoose-sequence")(mongoose); // import plugin

const easyshiorderSchema = new Schema(
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
    },
    trackingId: {
      type: String,
    },
    lastmileTrakingId: {
      type: String,
    },
    deliveryPartner: {
      type: String,
    },
    lastmilePartner: {
      type: String,
    },
    lastmileIdPermanent: {
      type: Boolean,
      default: false,
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
    shippingAmount: {
      type: Number,
    },
    orderAmount: {
      type: Number,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    gst: {
      type: String,
    },
    add: {
      type: String,
    },
    pincode: {
      type: String,
    },
    orderType: {
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

easyshiorderSchema.plugin(AutoIncrement, {
  inc_field: "invoice",
  id: "easyship_order_invoice",
  start_seq: 1000,
});

module.exports = mongoose.model("EasyShipOrder", easyshiorderSchema);
