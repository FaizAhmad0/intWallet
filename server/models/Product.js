const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    gstRate: {
      type: Number,
      required: true,
    },

    dimension: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Number,
      required: true,
    },
    hsn: {
      type: String,
      required: true,
    },
    
  },
  { timestamps: true }
);

const Product = model("Product", productSchema);
module.exports = Product;
