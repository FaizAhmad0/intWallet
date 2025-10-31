const express = require("express");
const router = express.Router();
const { getUserDetails } = require("../controllers/userController");
const auth = require("../middleware/auth");
const {
  addBalance,
  verifyBalance,
} = require("../controllers/walletConrollers");

router.post("/add-balance", auth, addBalance);
// router.post("/verify-payment", auth, verifyBalance);
router.post("/verify-payment", auth, verifyBalance);

module.exports = router;
