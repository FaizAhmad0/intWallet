const User = require("../models/User");
const Order = require("../models/EasyShipOrder");

const getAllManager = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments({ role: "manager" });
    const managers = await User.find({ role: "manager" })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      data: managers,
      total,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch managers" });
  }
};

const updateManager = async (req, res) => {
  const { id } = req.params;
  const { name, email, primaryContact } = req.body;
  try {
    const updatedManager = await User.findByIdAndUpdate(
      id,
      { name, email, primaryContact },
      { new: true }
    );
    if (!updatedManager) {
      return res.status(404).json({ error: "Manager not found" });
    }
    res.json(updatedManager);
  } catch (err) {
    res.status(500).json({ error: "Failed to update manager" });
  }
};

const getMyClients = async (req, res) => {
  try {
    const managerName = req.user.name; // logged-in manager
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const enrollmentId = req.query.enrollmentId?.trim();

    const skip = (page - 1) * limit;

    // If searching by enrollmentId
    if (enrollmentId) {
      // 🔹 First check if client exists at all
      const client = await User.findOne({ enrollmentIdAmazon: enrollmentId });

      if (!client) {
        return res.status(404).json({
          success: false,
          message: "No client found with this enrollment ID.",
        });
      }

      // 🔹 Check if client belongs to this manager
      if (client.amazonManager !== managerName) {
        return res.status(403).json({
          success: false,
          message: "This client is not associated with you.",
        });
      }

      // If client belongs to manager, return it
      return res.json({
        success: true,
        users: [client],
        total: 1,
        page: 1,
        totalPages: 1,
      });
    }

    // 🔹 Normal listing (no search)
    const [users, total] = await Promise.all([
      User.find({ amazonManager: managerName })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ amazonManager: managerName }),
    ]);

    res.json({
      success: true,
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching manager's users:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// const getManagerOrders = async (req, res) => {
//   try {
//     const managerName = req.user.name; // logged-in manager
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 50;
//     const status = req.query.status?.trim() || "";

//     const skip = (page - 1) * limit;

//     // 🔹 Build query
//     const query = { manager: managerName };
//     if (status !== "") {
//       query.status = status;
//     }

//     const [orders, total] = await Promise.all([
//       Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
//       Order.countDocuments(query),
//     ]);

//     res.json({
//       success: true,
//       orders,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     console.error("Error fetching manager's orders:", err);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

const getManagerOrders = async (req, res) => {
  try {
    const managerName = req.user.name; // logged-in manager
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status?.trim() || "";
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const skip = (page - 1) * limit;

    const query = { manager: managerName };

    // if status provided, filter by it
    if (status !== "") {
      query.status = status;
    }

    // if date range provided, filter createdAt
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching manager's orders:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
const createNewManager = async (req, res) => {
  try {
    const { name, email, primaryContact, password } = req.body;

    // Check for missing fields
    if (!name || !email || !primaryContact || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if manager already exists
    const existingManager = await User.findOne({ primaryContact });
    if (existingManager) {
      return res
        .status(409)
        .json({ message: "A manager with this contact already exists." });
    }

    // Get the last uid and increment it
    const lastUser = await User.findOne().sort({ uid: -1 }).limit(1);
    const newUid = lastUser ? lastUser.uid + 1 : 1;

    // Create the manager object
    const newManager = new User({
      uid: newUid,
      name,
      email,
      primaryContact,
      password,
      role: "manager", // Optional: if you distinguish roles
    });

    await newManager.save();

    return res.status(201).json({
      message: "Manager created successfully.",
      manager: newManager,
    });
  } catch (error) {
    console.error("Error creating manager:", error);
    return res.status(500).json({
      message: "An error occurred while creating the manager.",
      error: error.message,
    });
  }
};

module.exports = {
  createNewManager,
  getAllManager,
  updateManager,
  getMyClients,
  getManagerOrders,
};
