const express = require("express");
const router = express.Router();
const {
  getUserDetails,
  getBalance,
  getMyTransactions,
} = require("../controllers/userController");
const auth = require("../middleware/auth");
const { downloadUserTransactions } = require("../controllers/transactionConroller");

// router.post("/register", register);
// router.post("/login", login);
// router.post("/logoutAll", auth, logoutAll);
router.get("/user-details", auth, getUserDetails);
router.get("/transactions", auth, getMyTransactions);
router.get("/balance/:enrollment", auth, getBalance);
router.get("/download-transactions", auth, downloadUserTransactions);

module.exports = router;
