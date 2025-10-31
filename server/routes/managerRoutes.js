const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getMyClients, getManagerOrders } = require("../controllers/managerController");

router.get("/my-clients",auth,getMyClients);
router.get("/orders", auth, getManagerOrders);

module.exports = router;
