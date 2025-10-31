const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getAllUser, updateUser, getClientByEnrollment, bulkUpload } = require("../controllers/userController");
const {
  getAllManager,
  updateManager,
  createNewManager,
} = require("../controllers/managerController");
const {
  creditWallet,
  debitWallet,
  getUserTransactions,
  getAllTransactions,
} = require("../controllers/transactionConroller");
const { getShipment } = require("../controllers/orderConroller");

router.get("/all-clients", auth, getAllUser);
router.get("/managers", auth, getAllManager);
router.get("/user-transactions/:userId", auth, getUserTransactions);
router.get("/all-transactions", auth, getAllTransactions);
router.get("/get-client-by-enrollment/:id",auth, getClientByEnrollment);

router.post("/create-manager",auth, createNewManager);
router.post("/ship-order", getShipment);
router.put("/update-user/:id", auth, updateUser);
router.put("/managers/:id", auth, updateManager);
router.post("/add-money", auth, creditWallet);
router.post("/deduct-money", auth, debitWallet);
router.post("/bulk-upload", bulkUpload);

module.exports = router;
