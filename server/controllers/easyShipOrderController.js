const axios = require("axios");
const cron = require("node-cron");
const Order = require("../models/EasyShipOrder");
const User = require("../models/User");
const Product = require("../models/Product");
const Transaction = require("../models/Transactions");

const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream/promises");
const archiver = require("archiver");

exports.createEasyShipOrder = async (req, res) => {
  try {
    let {
      enrollment,
      orderId,
      trackingId,
      deliveryPartner,
      orderType,
      lastmilePartner,
      orderAmount,
      lastmileTrakingId,
      shippingAmount,
      country,
    } = req.body;

    enrollment =
      typeof enrollment === "string" ? enrollment.trim() : enrollment;
    orderId = typeof orderId === "string" ? orderId.trim() : orderId;
    trackingId =
      typeof trackingId === "string" ? trackingId.trim() : trackingId;
    const subtotal = orderAmount + shippingAmount;
    const finalAmount = subtotal + subtotal * 0.05;


    if (!enrollment || !orderId || !deliveryPartner) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Check for existing order
    const existing = await Order.findOne({ orderId });
    if (existing) {
      return res.status(409).json({ message: "Order ID already exists." });
    }

    // 🔹 Find user with enrollmentIdAmazon = enrollment
    const user = await User.findOne({ enrollmentIdAmazon: enrollment });

    const newOrder = new Order({
      enrollment,
      orderId,
      orderType,
      trackingId,
      deliveryPartner,
      lastmilePartner,
      lastmileTrakingId,
      finalAmount,
      orderAmount,
      shippingAmount,
      country,
      status: "NEW",
      date: new Date().toISOString(),
      manager: user ? user.amazonManager : null,
      brandName: user ? user.brandName : null,
      add: user ? user.address : null,
      pincode: user ? user.pincode : null,
    });

    await newOrder.save();

    res.status(201).json({
      message: "EasyShip order created successfully.",
      order: newOrder,
    });
  } catch (err) {
    console.error("Create EasyShip Order Error:", err.message);
    res.status(500).json({ message: "Failed to create order." });
  }
};

exports.getOrdersByDateRange = async (req, res) => {
  try {
    const { page = 1, limit = 100, status, startDate, endDate } = req.query;
    // console.log(status);

    const query = {};
    if (status) query.status = status;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({ orders, total });
  } catch (err) {
    console.error("Error fetching orders by date range:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getNewOrders = async (req, res) => {
  try {
    const { page = 1, limit = 100, status } = req.query;

    const query = {};

    // Optional status filtering
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({ orders, total });
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.searchAllOrders = async (req, res) => {
  try {
    const { search, status } = req.query;

    if (!search) {
      return res.status(400).json({ message: "Search text is required" });
    }

    const query = {
      $and: [
        {
          $or: [
            { orderId: { $regex: search, $options: "i" } },
            { trackingId: { $regex: search, $options: "i" } },
            { enrollment: { $regex: search, $options: "i" } },
          ],
        },
      ],
    };

    if (status) {
      query.$and.push({ status });
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    const total = await Order.countDocuments(query);

    res.json({ orders, total });
  } catch (err) {
    console.error("Search all orders error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addSKUToOrder = async (req, res) => {
  try {
    const { enrollment, shipmentId, sku } = req.body;
    const skuList = sku.split(",").map((s) => s.trim());

    const user = await User.findOne({ enrollmentIdAmazon: enrollment });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const requiredFields = [user.address, user.pincode, user.state];
    const isIncomplete = requiredFields.some(
      (field) => !field || field.trim() === ""
    );

    if (isIncomplete) {
      return res
        .status(400)
        .json({ message: "Update user details (ADD, GST, PINCODE, State)" });
    }

    const order = await Order.findById(shipmentId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let newItems = [];
    // let totalAmount = 0;

    // for (const singleSKU of skuList) {
    //   const product = await Product.findOne({ sku: singleSKU });
    //   if (!product) {
    //     return res
    //       .status(404)
    //       .json({ message: `Product with SKU ${singleSKU} not found` });
    //   }

    //   const baseAmount = product.price + product.shipping;
    //   const itemAmount = baseAmount + (baseAmount * product.gstRate) / 100;
    //   totalAmount += itemAmount;

    //   newItems.push({
    //     name: product.name,
    //     sku: product.sku,
    //     price: product.price,
    //     shipping: product.shipping,
    //     gstRate: product.gstRate,
    //     dimension: product.dimension,
    //     weight: product.weight,
    //     hsn: product.hsn,
    //     quantity: 1,
    //   });
    // }
    for (const singleSKU of skuList) {
      const product = await Product.findOne({ sku: singleSKU });
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product with SKU ${singleSKU} not found` });
      }

      // ✅ If Easy-ship, exclude shipping from calculation
      // const shippingCost =
      //   order.orderType === "Easy-ship" ? 0 : product.shipping;
      // const baseAmount = product.price + shippingCost;
      // const itemAmount = baseAmount + (baseAmount * product.gstRate) / 100;
      // totalAmount += itemAmount;

      newItems.push({
        name: product.name,
        sku: product.sku,
        price: product.price,
        gstRate: product.gstRate,
        dimension: product.dimension,
        weight: product.weight,
        hsn: product.hsn,
        quantity: 1,
      });
    }

    order.items = [...order.items, ...newItems];
    order.brandName = user.brandName;
    order.manager = user.amazonManager;
    order.state = user.state;
    if (user.amount >= order.finalAmount) {
      // Deduct from user
      user.amount -= order.finalAmount;
      await user.save();

      // Create transaction
      const newTransaction = new Transaction({
        userId: user._id.toString(),
        enrollmentIdAmazon: user.enrollmentIdAmazon,
        amount: order.finalAmount.toFixed(2),
        credit: false,
        debit: true,
        description: "Deduct while purchasing product",
      });
      await newTransaction.save();

      order.status = "RTD";
    } else {
      order.status = "HMI";
    }

    await order.save();

    return res.status(200).json({
      message: "SKU(s) added to order successfully",
      updatedOrder: order,
    });
  } catch (err) {
    console.error("Error adding SKU to order:", err.message);
    return res
      .status(500)
      .json({ message: "Server error while adding SKU to order" });
  }
};

exports.archiveOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { status: "Archived" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Order archived successfully",
      order: updated,
    });
  } catch (error) {
    console.error("archiveOrder error:", error.message || error);
    return res.status(500).json({
      message: "Server error while archiving order",
      error: error.message || error,
    });
  }
};
exports.returnAdjust = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { status: "RA" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Return adjust successfully",
      order: updated,
    });
  } catch (error) {
    console.error("return adjust error:", error.message || error);
    return res.status(500).json({
      message: "Server error while return adjusting the order",
      error: error.message || error,
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const deleted = await Order.findByIdAndDelete(orderId);

    if (!deleted) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Order deleted successfully",
      order: deleted,
    });
  } catch (error) {
    console.error("delete order error:", error.message || error);
    return res.status(500).json({
      message: "Server error while deleting the order",
      error: error.message || error,
    });
  }
};

// PUT /easyshiporders/update-status/:orderId

exports.updateEasyShipOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.updatePermaAndTemp = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.lastmileIdPermanent = !order.lastmileIdPermanent;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.handlePayment = async (req, res) => {
  try {
    const { enrollment, orderId, finalAmount } = req.body;

    const user = await User.findOne({ enrollmentIdAmazon: enrollment });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.amount < finalAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct amount
    user.amount -= finalAmount;
    await user.save();

    // Update order status
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "RTD";
    await order.save();

    // Create transaction
    const transaction = new Transaction({
      userId: user._id,
      enrollmentIdAmazon: enrollment,
      amount: finalAmount,
      debit: true,
      credit: false,
      description: "Deduct while purchasing product",
    });
    await transaction.save();

    res.json({ message: "Payment successful" });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ message: "Payment failed" });
  }
};

exports.getMyOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const enrollmentIdAmazon = req.user.enrollmentIdAmazon;
    const [orders, totalCount] = await Promise.all([
      Order.find({ enrollment: enrollmentIdAmazon })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ enrollment: enrollmentIdAmazon }),
    ]);
    res.status(200).json({ orders, totalCount });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getShippedOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ status: "SHIPPED" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments({ status: "SHIPPED" }),
    ]);

    res.status(200).json({ orders, total });
  } catch (error) {
    console.error("Error fetching SHIPPED orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.searchShippedOrder = async (req, res) => {
  try {
    const { trackingId } = req.query;
    if (!trackingId) {
      return res
        .status(400)
        .json({ success: false, message: "Tracking ID required" });
    }

    const orders = await Order.find({
      status: "SHIPPED",
      trackingId: trackingId.trim(),
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error searching SHIPPED order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getShippedOrdersByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res
        .status(400)
        .json({ message: "Start and end dates are required." });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    const orders = await Order.find({
      status: "SHIPPED",
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error("Error fetching shipped orders by date range:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteAdminOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
