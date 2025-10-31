const User = require("../models/User");
const Transaction = require("../models/Transactions");
const XLSX = require("xlsx");

const getAllUser = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const [clients, total] = await Promise.all([
      User.find({ role: "user" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ role: "user" }),
    ]);

    res.json({
      clients,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const id = req.user.id;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateUser = async (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields dynamically
    Object.keys(updateData).forEach((key) => {
      user[key] = updateData[key];
    });

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user", error });
  }
};

const getClientByEnrollment = async (req, res) => {
  const { id } = req.params;

  try {
    const client = await User.findOne({ enrollmentIdAmazon: id });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({ client });
  } catch (error) {
    console.error("Error fetching client by enrollment ID:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const logoutAll = async (req, res) => {
  try {
    req.user.tokenVersion += 1;
    await req.user.save();
    res.json({ message: "Logged out from all devices" });
  } catch {
    res.status(500).json({ error: "Logout failed" });
  }
};

const getMyTransactions = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const enrollmentIdAmazon = req.user.enrollmentIdAmazon;

    const [transactions, totalCount] = await Promise.all([
      Transaction.find({ enrollmentIdAmazon })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments({ enrollmentIdAmazon }),
    ]);

    res.status(200).json({ transactions, totalCount });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getBalance = async (req, res) => {
  try {
    const { enrollment } = req.params;
    const user = await User.findOne({ enrollmentIdAmazon: enrollment });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ amount: user.amount });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const bulkUpload = async (req, res) => {
  try {
    const usersData = req.body;

    if (!Array.isArray(usersData) || usersData.length === 0) {
      return res.status(400).json({ message: "Invalid or empty data." });
    }

    const lastUser = await User.findOne().sort({ uid: -1 }).limit(1);
    let currentUid = lastUser?.uid || 0;

    const createdUsers = [];
    const updatedUsers = [];
    const skippedUsers = [];

    for (const user of usersData) {
      const {
        name,
        email,
        enrollment,
        primaryContact,
        date,
        batch,
        manager,
        enrolledBy,
      } = user;

      if (
        !name ||
        !email ||
        !enrollment ||
        !primaryContact ||
        !date ||
        !batch ||
        !manager
      ) {
        skippedUsers.push({
          enrollment,
          reason: "Missing required fields.",
        });
        continue;
      }

      const namePrefix = String(name).slice(0, 2).toLowerCase();
      const mobileSuffix = String(primaryContact).slice(-2);
      const enrollmentPrefix = String(enrollment).slice(0, 2).toUpperCase();

      const existingUser = await User.findOne({ primaryContact });

      const tl = await User.findOne({ name: manager });
      if (!tl) {
        skippedUsers.push({
          enrollment,
          reason: `${manager} is not defined as a manager.`,
        });
        continue;
      }

      if (existingUser) {
        let updated = false;

        if (enrollmentPrefix === "AZ" && !existingUser.enrollmentIdAmazon) {
          existingUser.enrollmentIdAmazon = enrollment;
          existingUser.amazonManager = manager;
          existingUser.batchAmazon = batch;
          existingUser.dateAmazon = date;
          updated = true;
        } else if (
          enrollmentPrefix === "WB" &&
          !existingUser.enrollmentIdWebsite
        ) {
          existingUser.enrollmentIdWebsite = enrollment;
          existingUser.websiteManager = manager;
          existingUser.batchWebsite = batch;
          existingUser.dateWebsite = date;
          updated = true;
        } else if (
          enrollmentPrefix === "ET" &&
          !existingUser.enrollmentIdEtsy
        ) {
          existingUser.enrollmentIdEtsy = enrollment;
          existingUser.etsyManager = manager;
          existingUser.batchEtsy = batch;
          existingUser.dateEtsy = date;
          updated = true;
        }

        if (updated) {
          await existingUser.save();
          updatedUsers.push(existingUser);
        } else {
          skippedUsers.push({
            enrollment,
            reason: "Enrollment already exists for this contact.",
          });
        }

        continue;
      }

      // Create new user (even if email already exists)
      currentUid += 1;
      const password =
        `UID${currentUid}@${namePrefix}@${mobileSuffix}`.toUpperCase();

      const newUserData = {
        uid: currentUid,
        name,
        email,
        primaryContact,
        password,
        enrolledBy,
      };

      if (enrollmentPrefix === "AZ") {
        newUserData.enrollmentIdAmazon = enrollment;
        newUserData.amazonManager = manager;
        newUserData.batchAmazon = batch;
        newUserData.dateAmazon = date;
      } else if (enrollmentPrefix === "WB") {
        newUserData.enrollmentIdWebsite = enrollment;
        newUserData.websiteManager = manager;
        newUserData.batchWebsite = batch;
        newUserData.dateWebsite = date;
      } else if (enrollmentPrefix === "ET") {
        newUserData.enrollmentIdEtsy = enrollment;
        newUserData.etsyManager = manager;
        newUserData.batchEtsy = batch;
        newUserData.dateEtsy = date;
      } else {
        newUserData.enrollment = enrollment;
        newUserData.manager = manager;
        newUserData.batch = batch;
        newUserData.date = date;
      }

      const newUser = new User(newUserData);
      await newUser.save();
      createdUsers.push(newUser);
    }

    // Export skipped users to Excel if any
    if (skippedUsers.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(skippedUsers);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Skipped Users");

      const buffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=skipped_users.xlsx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      return res.status(200).send(buffer);
    }

    // If no skipped users, send JSON
    res.status(200).json({
      message: "Bulk user processing completed.",
      created: createdUsers.length,
      updated: updatedUsers.length,
      skipped: skippedUsers.length,
      createdUsers,
      updatedUsers,
    });
  } catch (error) {
    console.error("Error in bulk user upload:", error);
    res.status(500).json({
      message: "An error occurred during bulk upload.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUser,
  logoutAll,
  updateUser,
  getUserDetails,
  getBalance,
  getMyTransactions,
  getClientByEnrollment,
  bulkUpload,
};
