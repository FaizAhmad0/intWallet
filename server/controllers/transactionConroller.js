const User = require("../models/User");
const Transaction = require("../models/Transactions");
const XLSX = require("xlsx");

const creditWallet = async (req, res) => {
  try {
    const { enrollmentIdAmazon, userId, amount, description } = req.body;

    if (!userId || !amount || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.amount = (user.amount || 0) + parseFloat(amount);
    await user.save();

    const transactionData = {
      email:user.email,
      userId,
      enrollmentIdAmazon,
      amount: parseFloat(amount),
      description,
      credit: true,
      debit: false,
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    res.status(200).json({ message: "Amount credited successfully" });
  } catch (error) {
    console.error("Error in creditWallet:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const debitWallet = async (req, res) => {
  try {
    const { enrollmentIdAmazon, userId, amount, description } = req.body;

    if (!userId || !amount || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if ((user.amount || 0) < parseFloat(amount)) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    user.amount -= parseFloat(amount);
    await user.save();

    const transaction = new Transaction({
      email:user.email,
      userId,
      enrollmentIdAmazon,
      amount: parseFloat(amount),
      description,
      credit: false,
      debit: true,
    });
    await transaction.save();

    res.status(200).json({ message: "Amount debited successfully" });
  } catch (error) {
    console.error("Error in debitWallet:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await Transaction.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Error in getUserTransactions:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    let { page = 1, limit = 100, startDate, endDate } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};

    // 🔹 Apply date filter if range selected
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate + "T00:00:00.000Z"),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    // 🔹 If no date range → return paginated (for table)
    if (!startDate || !endDate) {
      const [transactions, total] = await Promise.all([
        Transaction.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Transaction.countDocuments(filter),
      ]);

      return res.json({ transactions, total });
    }

    // 🔹 If date range provided → return all data (for excel)
    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });
    return res.json({ transactions });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const downloadUserTransactions = async (req, res) => {
  try {
    const enrollmentIdAmazon = req.user?.enrollmentIdAmazon; // ✅ from auth
    if (!enrollmentIdAmazon) {
      return res.status(400).json({ message: "No Amazon Enrollment ID found" });
    }

    // ✅ Get transactions for this user
    const transactions = await Transaction.find({
      enrollmentIdAmazon,
    });

    if (!transactions.length) {
      return res.status(404).json({ message: "No transactions found" });
    }

    // ✅ Convert to plain JSON
    const data = transactions.map((t) => ({
      Date: t.createdAt,
      Amount: t.amount,
      Credit: t.credit,
      Debit: t.debit,
      Description: t.description,
      PaymentId: t.paymentId,
    }));

    // ✅ Create Excel workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // ✅ Send file as response
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Transaction_History.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (err) {
    console.error("Download transactions error:", err);
    res
      .status(500)
      .json({ message: "Server error while downloading transactions" });
  }
};

module.exports = {
  creditWallet,
  debitWallet,
  getUserTransactions,
  getAllTransactions,
  downloadUserTransactions,
};
