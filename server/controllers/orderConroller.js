const axios = require("axios");
const cron = require("node-cron");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const Transaction = require("../models/Transactions");

const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream/promises");
const archiver = require("archiver");

const fetchAndSaveShiprocketOrders = async () => {
  try {
    const authResponse = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    const token = authResponse.data.token;
    const now = new Date();
    const bufferMinutes = 10;
    const rangeStart = new Date(
      now.getTime() - 2 * 60 * 60 * 1000 - bufferMinutes * 60 * 1000
    );

    const response = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/orders?per_page=500&page=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const orders = response.data.data || [];
    const recentOrders = orders.filter((order) => {
      const createdAt = new Date(order.created_at);
      return createdAt >= rangeStart;
    });

    if (recentOrders.length === 0) {
      console.log("No new orders found in the last 2 hours.");
      return;
    }

    for (const order of recentOrders) {
      const shipment = Array.isArray(order.shipments)
        ? order.shipments[0]
        : null;

      const trackingId = shipment?.awb || "";
      const deliveryPartner = shipment?.courier || "";
      const shipmentId = shipment?.id || null;

      const asku = Array.isArray(order.products)
        ? order.products
            .map((p) => p.channel_sku)
            .filter(Boolean)
            .join(", ")
        : "";

      const orderData = {
        enrollment: order.brand_name || "",
        orderId: order.channel_order_id || "",
        date: new Date(order.created_at),
        shipmentId,
        trackingId,
        status: "NEW",
        deliveryPartner,
        asku,
      };

      const alreadyExists = await Order.findOne({ orderId: orderData.orderId });
      if (!alreadyExists) {
        await Order.create(orderData);
        console.log(`Saved Order: ${orderData.orderId}`);
      } else {
        console.log(`Skipped duplicate: ${orderData.orderId}`);
      }
    }

    console.log(`${recentOrders.length} recent orders processed and stored.`);
  } catch (err) {
    console.error(
      "Error in scheduled Shiprocket fetch:",
      err.response?.data || err.message
    );
  }
};

exports.scheduleShiprocketFetch = () => {
  cron.schedule("0 */2 * * *", fetchAndSaveShiprocketOrders);
};

exports.getAllScheduleOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ status: "Schedule" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ status: "Schedule" }),
    ]);

    res.status(200).json({ orders, total });
  } catch (err) {
    console.error("Error fetching schedule orders:", err.message);
    res
      .status(500)
      .json({ message: "Server error while fetching schedule orders" });
  }
};

exports.getAllArchivedOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ status: "Archived" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ status: "Archived" }),
    ]);

    res.status(200).json({ orders, total });
  } catch (err) {
    console.error("Error fetching Archived orders:", err.message);
    res
      .status(500)
      .json({ message: "Server error while fetching Archived orders" });
  }
};

exports.getAllStatusOrders = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({})
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit)),
      Order.countDocuments(),
    ]);

    res.json({ orders, total });
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.searchAllOrders = async (req, res) => {
  try {
    const { search } = req.query;

    const orders = await Order.find({
      $or: [
        { orderId: { $regex: search, $options: "i" } },
        { trackingId: { $regex: search, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.error("Search all orders error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ status: "NEW" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ status: "NEW" }),
    ]);
    res.status(200).json({ orders, total });
  } catch (err) {
    console.error("Error fetching orders:", err.message);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

exports.schedulePickup = async (req, res) => {
  try {
    const { shipmentId } = req.body;
    // console.log("Received shipmentId:", shipmentId);

    if (!shipmentId) {
      return res.status(400).json({ message: "shipmentId is required" });
    }

    const shipmentIdNumber = parseInt(shipmentId, 10);
    if (isNaN(shipmentIdNumber)) {
      return res
        .status(400)
        .json({ message: "shipmentId must be a valid number" });
    }

    // Step 1: Authenticate with Shiprocket
    const authRes = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );
    const token = authRes.data.token;
    // console.log("Authenticated with Shiprocket");

    // Step 2: Get shipment details
    const shipmentRes = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/shipments/${shipmentIdNumber}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const shipmentData = shipmentRes?.data?.data;
    const currentStatus = shipmentData?.status;
    const awb = shipmentData?.awb;
    // console.log("Shipment status:", currentStatus, "| AWB:", awb);

    if (!awb) {
      return res.status(400).json({
        message: "AWB not generated. Cannot schedule pickup without AWB.",
      });
    }

    // Step 3: Generate Manifest (only if READY TO SHIP)
    if (currentStatus === 1) {
      try {
        const manifestRes = await axios.post(
          "https://apiv2.shiprocket.in/v1/external/manifests/generate",
          { shipment_id: [shipmentIdNumber] },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        // console.log("Manifest generated:", manifestRes.data);
      } catch (err) {
        const msg = err?.response?.data?.message;
        if (msg === "Manifest already generated") {
          console.log("Manifest already exists");
        } else {
          console.error("Manifest error:", msg || err.message);
          return res.status(400).json({
            message: "Manifest generation failed",
            error: msg || err.message,
          });
        }
      }
    } else {
      console.log("ℹSkipping manifest generation (status not READY TO SHIP)");
    }

    // Step 4: Schedule Pickup (only if READY TO SHIP)
    let pickupScheduled = false;
    if (currentStatus === 1) {
      try {
        const pickupRes = await axios.post(
          "https://apiv2.shiprocket.in/v1/external/courier/generate/pickup",
          { shipment_id: shipmentIdNumber },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        // console.log("Pickup scheduled:", pickupRes?.data);
        pickupScheduled = true;
      } catch (err) {
        const msg = err?.response?.data?.message;
        const code = err?.response?.data?.status_code;
        if (msg === "Already in Pickup Queue." && code === 400) {
          console.warn("ℹAlready in Pickup Queue");
        } else {
          console.error("Pickup scheduling error:", msg || err.message);
          return res.status(500).json({
            message: "Pickup scheduling failed",
            error: msg || err.message,
          });
        }
      }
    } else if (currentStatus === 2) {
      console.log("Shipment already in pickup queue. No need to reschedule.");
    } else {
      return res.status(400).json({
        message:
          "Shipment is not eligible for pickup (not READY TO SHIP or already shipped)",
        shiprocketStatus: currentStatus,
      });
    }

    // Step 5: Update local DB to RTD
    const updatedOrder = await Order.findOneAndUpdate(
      { shipmentId: String(shipmentIdNumber) },
      { status: "Recieved" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found in DB" });
    }

    return res.status(200).json({
      message: pickupScheduled
        ? "Pickup scheduled successfully. Status updated to RTD."
        : "Pickup already scheduled. Status updated to RTD.",
      order: updatedOrder,
      shiprocketStatus: currentStatus,
    });
  } catch (error) {
    console.error(
      "schedulePickup error:",
      error?.response?.data || error.message
    );
    return res.status(500).json({
      message: "Server error while scheduling pickup",
      error: error?.response?.data || error.message,
    });
  }
};

exports.archiveOrder = async (req, res) => {
  try {
    const { shipmentId } = req.body;

    if (!shipmentId) {
      return res.status(400).json({ message: "shipmentId is required" });
    }

    const updated = await Order.findOneAndUpdate(
      { shipmentId: String(shipmentId) },
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

// GET /orders/schedule/search?search=abc123
exports.searchScheduledOrders = async (req, res) => {
  try {
    const { search } = req.query;
    const regex = new RegExp(search, "i");

    const orders = await Order.find({
      status: "Schedule",
      $or: [{ orderId: regex }, { trackingId: regex }],
    }).sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ message: "Search failed" });
  }
};

exports.searchArchivedOrders = async (req, res) => {
  try {
    const { search } = req.query;
    const regex = new RegExp(search, "i");

    const orders = await Order.find({
      status: "Archived",
      $or: [{ orderId: regex }, { trackingId: regex }],
    }).sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ message: "Search failed" });
  }
};

exports.unarchiveOrder = async (req, res) => {
  try {
    const { shipmentId } = req.body;

    if (!shipmentId) {
      return res.status(400).json({ message: "Shipment ID is required" });
    }

    const order = await Order.findOne({ shipmentId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Archived") {
      return res
        .status(400)
        .json({ message: `Cannot unarchive. Current status: ${order.status}` });
    }

    order.status = "HMI";
    await order.save();

    return res.json({ message: "Order status updated to HMI" });
  } catch (err) {
    console.error("Unarchive error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.assignAwb = async (req, res) => {
  try {
    // Find orders with status NEW and shipmentId not null
    const orders = await Order.find({
      status: "NEW",
      shipmentId: { $ne: null },
    });

    if (!orders.length) {
      return res.status(404).json({ message: "No NEW orders found" });
    }

    // Authenticate with Shiprocket
    const authResponse = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    const token = authResponse.data.token;
    const updatedOrders = [];

    // Loop through each order
    for (const order of orders) {
      try {
        const response = await axios.post(
          "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
          { shipment_id: order.shipmentId },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Safely extract awb_code and courier_name
        const awbCode = response?.data?.response?.data?.awb_code;
        const courierName = response?.data?.response?.data?.courier_name;

        if (awbCode) {
          order.trackingId = awbCode;
          order.deliveryPartner = courierName || order.deliveryPartner;
          order.status = "In Progress";

          await order.save();

          updatedOrders.push({
            orderId,
            trackingId: awbCode,
            deliveryPartner: courierName,
          });
        } else {
          console.warn(`No AWB assigned for shipmentId: ${order.shipmentId}`);
        }
      } catch (err) {
        console.error(
          `Error assigning AWB for shipmentId ${order.shipmentId}:`,
          err?.response?.data || err.message
        );
      }
    }

    return res.status(200).json({
      message: "AWB assignment process completed.",
      updatedOrders,
    });
  } catch (error) {
    console.error("Error in assignAwb controller:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getHMIOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ status: "HMI" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ status: "HMI" }),
    ]);

    res.status(200).json({
      success: true,
      orders,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching ready-to-dispatch orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ready-to-dispatch orders",
    });
  }
};
exports.getReadyToDispatchOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ status: "RTD" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ status: "RTD" }),
    ]);

    res.status(200).json({
      success: true,
      orders,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching ready-to-dispatch orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ready-to-dispatch orders",
    });
  }
};

exports.getShipment = async (req, res) => {
  const shipment_id = "825294701";

  try {
    const authResponse = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    const token = authResponse.data.token;

    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
      {
        shipment_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error(
      "Shiprocket AWB error:",
      error?.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to assign AWB",
    });
  }
};

exports.assignSelectedAwb = async (req, res) => {
  const { shipmentIds } = req.body;

  if (!Array.isArray(shipmentIds) || shipmentIds.length === 0) {
    return res.status(400).json({ message: "No shipmentIds provided" });
  }

  try {
    // Find matching orders with NEW status
    const orders = await Order.find({
      shipmentId: { $in: shipmentIds },
      status: "NEW",
    });

    if (!orders.length) {
      return res.status(404).json({ message: "No matching NEW orders found" });
    }

    // Authenticate with Shiprocket
    const authResponse = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    const token = authResponse.data.token;
    const updatedOrders = [];

    for (const order of orders) {
      try {
        const response = await axios.post(
          "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
          { shipment_id: order.shipmentId },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const awbCode = response?.data?.response?.data?.awb_code;
        const courierName = response?.data?.response?.data?.courier_name;

        if (awbCode) {
          order.trackingId = awbCode;
          order.deliveryPartner = courierName || order.deliveryPartner;
          order.status = "In Progress";
          await order.save();

          updatedOrders.push({
            shipmentId: order.shipmentId,
            trackingId: awbCode,
            deliveryPartner: courierName,
          });
        } else {
          console.warn(`No AWB assigned for shipmentId: ${order.shipmentId}`);
        }
      } catch (err) {
        console.error(
          `Error assigning AWB for shipmentId ${order.shipmentId}:`,
          err?.response?.data || err.message
        );
      }
    }

    return res.status(200).json({
      message: "Selected AWB assignment process completed.",
      updatedOrders,
    });
  } catch (error) {
    console.error("Error in assignSelectedAwb controller:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getInProgressOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = { status: "In Progress" };

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      orders,
      total,
    });
  } catch (error) {
    console.error("Error fetching in-progress orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.markProductNotAvailable = async (req, res) => {
  try {
    const { shipmentId } = req.body;
    const order = await Order.findOne({ shipmentId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "Product Not Available";
    await order.save();

    res.status(200).json({ message: "Order marked as Product Not Available" });
  } catch (err) {
    console.error("Error marking product as not available:", err.message);
    res
      .status(500)
      .json({ message: "Server error while marking product as not available" });
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

    const requiredFields = [
      user.address,
      user.gst,
      user.country,
      user.pincode,
      user.state,
      user.gst,
    ];
    const isIncomplete = requiredFields.some(
      (field) => !field || field.trim() === ""
    );

    if (isIncomplete) {
      return res
        .status(400)
        .json({ message: "Update user details (ADD, GST, PINCODE, State)" });
    }

    const order = await Order.findOne({ shipmentId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let newItems = [];
    let totalAmount = 0;

    for (const singleSKU of skuList) {
      const product = await Product.findOne({ sku: singleSKU });
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product with SKU ${singleSKU} not found` });
      }

      const baseAmount = product.price + product.shipping;
      const itemAmount = baseAmount + (baseAmount * product.gstRate) / 100;
      totalAmount += itemAmount;

      newItems.push({
        name: product.name,
        sku: product.sku,
        price: product.price,
        shipping: product.shipping,
        gstRate: product.gstRate,
        dimension: product.dimension,
        weight: product.weight,
        hsn: product.hsn,
        quantity: 1,
      });
    }

    order.items = [...order.items, ...newItems];
    order.finalAmount = (order.finalAmount || 0) + totalAmount;
    order.brandName = user.brandName;
    order.manager = user.amazonManager;
    order.state = user.state;
    order.gst = user.gst;

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

      order.status = "Schedule";
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

// exports.addSKUToOrder = async (req, res) => {
//   try {
//     const { enrollment, shipmentId, sku } = req.body;
//     const skuList = sku.split(",").map((s) => s.trim());

//     const user = await User.findOne({ enrollmentIdAmazon: enrollment });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const order = await Order.findOne({ shipmentId });
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     let newItems = [];
//     let totalAmount = 0;

//     for (const singleSKU of skuList) {
//       const product = await Product.findOne({ sku: singleSKU });
//       if (!product) {
//         return res
//           .status(404)
//           .json({ message: `Product with SKU ${singleSKU} not found` });
//       }

//       const itemAmount =
//         product.price + (product.price * product.gstRate) / 100;
//       totalAmount += itemAmount;

//       newItems.push({
//         name: product.name,
//         sku: product.sku,
//         price: product.price,
//         gstRate: product.gstRate,
//         dimension: product.dimension,
//         weight: product.weight,
//         hsn: product.hsn,
//         quantity: 1,
//       });
//     }

//     order.items = [...order.items, ...newItems];
//     order.finalAmount = (order.finalAmount || 0) + totalAmount;

//     if (user.amount >= order.finalAmount) {
//       // Deduct from user
//       user.amount -= order.finalAmount;
//       await user.save();

//       // Create transaction
//       const newTransaction = new Transaction({
//         userId: user._id.toString(),
//         enrollmentIdAmazon: user.enrollmentIdAmazon,
//         amount: order.finalAmount.toFixed(2),
//         credit: false,
//         debit: true,
//         description: "Deduct while purchasing product",
//       });
//       await newTransaction.save();

//       order.status = "Recieved";
//     } else {
//       order.status = "HMI";
//     }

//     await order.save();

//     return res.status(200).json({
//       message: "SKU(s) added to order successfully",
//       updatedOrder: order,
//     });
//   } catch (err) {
//     console.error("Error adding SKU to order:", err.message);
//     return res
//       .status(500)
//       .json({ message: "Server error while adding SKU to order" });
//   }
// };

exports.searchPnaOrders = async (req, res) => {
  try {
    const { trackingId } = req.query;
    if (!trackingId) {
      return res
        .status(400)
        .json({ success: false, message: "Tracking ID required" });
    }

    const orders = await Order.find({
      status: "PNA",
      trackingId: trackingId.trim(),
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error searching PNA order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// controllers/orderController.js
exports.searchOrdersByEnrollment = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      orderId,
      enrollment,
      status = "HMI",
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    if (status) query.status = status;
    if (orderId) query.orderId = orderId;
    if (enrollment) query.enrollment = enrollment;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    res.status(200).json({ orders, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

exports.searchOrdersByDateRange = async (req, res) => {
  try {
    const { from, to, status, page = 1, limit = 100 } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "'from' and 'to' dates are required",
      });
    }

    // Parse and adjust date range
    const startDate = new Date(from);
    const endDate = new Date(to);
    endDate.setHours(23, 59, 59, 999); // Include full 'to' day

    const query = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      orders,
      total,
    });
  } catch (error) {
    console.error("Error fetching orders by date range:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.searchReadyToDispatchOrder = async (req, res) => {
  try {
    const { trackingId } = req.query;
    if (!trackingId) {
      return res
        .status(400)
        .json({ success: false, message: "Tracking ID required" });
    }

    const orders = await Order.find({
      status: "RTD",
      trackingId: trackingId.trim(),
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error searching RTD order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["SHIPPED", "PNA"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res
      .status(200)
      .json({ success: true, message: `Order marked as ${status}` });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getOrdersWithPNAStatus = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ status: "PNA" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments({ status: "PNA" }),
    ]);

    res.status(200).json({ orders, total });
  } catch (error) {
    console.error("Error fetching PNA orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// controllers/orderController.js
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

exports.getTotalOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({}).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments({}),
    ]);
    res.status(200).json({ orders, total });
  } catch (error) {
    console.error("Error fetching SHIPPED orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller
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

exports.searchHmiOrderByOrderId = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      orderId,
      enrollment,
      status = "HMI",
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    if (status) query.status = status;
    if (orderId) query.orderId = orderId;
    if (enrollment) query.enrollment = enrollment;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    res.status(200).json({ orders, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

exports.searchInProgressOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const orders = await Order.find({
      status: "In Progress",
      orderId: orderId.trim(),
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error searching In Progress order:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.searchInProgressOrderByTrackingId = async (req, res) => {
  try {
    const { trackingId } = req.query;

    if (!trackingId) {
      return res.status(400).json({
        success: false,
        message: "Tracking ID is required",
      });
    }

    const orders = await Order.find({
      status: "In Progress",
      trackingId: trackingId.trim(),
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error searching In Progress order by Tracking ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getRecievedOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ status: "Recieved" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments({ status: "Recieved" }),
    ]);

    res.status(200).json({ orders, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch received orders" });
  }
};

exports.generateLabels = async (req, res) => {
  try {
    let { shipmentIds } = req.body;
    // console.log("Received shipment IDs:", shipmentIds);

    if (!Array.isArray(shipmentIds) || shipmentIds.length === 0) {
      return res.status(400).json({ message: "No shipment IDs provided" });
    }

    // Convert to number
    shipmentIds = shipmentIds.map((id) => Number(id)).filter(Boolean);

    // Authenticate with Shiprocket
    const authRes = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    const token = authRes.data.token;
    if (!token) throw new Error("Shiprocket login failed");

    const tempFolder = path.join(__dirname, "../temp_labels");
    if (!fs.existsSync(tempFolder))
      fs.mkdirSync(tempFolder, { recursive: true });

    const labelPaths = [];

    for (const shipmentId of shipmentIds) {
      try {
        // Call label generation API
        const labelRes = await axios.post(
          "https://apiv2.shiprocket.in/v1/external/courier/generate/label",
          { shipment_id: [shipmentId] },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = labelRes.data;
        // console.log(`Label generation for ${shipmentId}:`, data);

        const labelUrl = data.label_url;
        if (!labelUrl) throw new Error("No label_url in response");

        // Download the PDF from labelUrl
        const labelFilePath = path.join(tempFolder, `${shipmentId}.pdf`);
        const pdfStream = await axios.get(labelUrl, { responseType: "stream" });
        await pipeline(pdfStream.data, fs.createWriteStream(labelFilePath));
        labelPaths.push(labelFilePath);

        // Update order status to RTD
        await Order.findOneAndUpdate(
          { shipmentId },
          { status: "RTD" },
          { new: true }
        );
      } catch (innerErr) {
        console.warn(
          `Error processing ${shipmentId}:`,
          innerErr.response?.data || innerErr.message
        );
      }
    }

    if (labelPaths.length === 0) {
      return res.status(400).json({ message: "No labels were downloaded" });
    }

    // Create a zip of all labels
    const zipPath = path.join(tempFolder, "labels.zip");
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);
    labelPaths.forEach((filePath) => {
      archive.file(filePath, { name: path.basename(filePath) });
    });

    await archive.finalize();

    output.on("close", () => {
      res.download(zipPath, "labels.zip", (err) => {
        if (err) {
          console.error("Error sending ZIP:", err);
          return res.status(500).send("Error downloading labels.");
        }

        // Delay deletion slightly to ensure file handles are released
        setTimeout(() => {
          try {
            fs.rmSync(tempFolder, { recursive: true, force: true });
            console.log("Cleaned up temp_labels folder");
          } catch (cleanupErr) {
            console.error("Cleanup failed:", cleanupErr);
          }
        }, 100); // wait 1 second before trying to delete
      });
    });
  } catch (err) {
    console.error(
      "Label generation failed:",
      err.response?.data || err.message
    );
    res.status(500).json({ message: "Label generation failed" });
  }
};

exports.markUnshipped = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required." });
  }

  try {
    const order = await Order.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Internal server error." });
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

    order.status = "Schedule";
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

exports.markAvailable = async (req, res) => {
  try {
    const { shipmentId } = req.body;

    if (!shipmentId) {
      return res.status(400).json({ message: "Shipment ID is required" });
    }

    const order = await Order.findOne({ shipmentId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "RTD";
    await order.save();

    return res.status(200).json({ message: "Order marked as RTD" });
  } catch (error) {
    console.error("Error marking order as RTD:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /orders/manager-orders?page=1&limit=20
exports.getManagerOrders = async (req, res) => {
  try {
    const managerName = req.user.name;
    const users = await User.find({ amazonManager: managerName, role: "user" });

    const enrollmentIds = users
      .map((user) => user.enrollmentIdAmazon)
      .filter(Boolean);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments({
      enrollment: { $in: enrollmentIds },
    });

    const orders = await Order.find({
      enrollment: { $in: enrollmentIds },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      orders,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error in getManagerOrders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Example controller for server-side pagination
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
