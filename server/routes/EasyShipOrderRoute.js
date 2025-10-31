const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createEasyShipOrder,
  getNewOrders,
  searchAllOrders,
  addSKUToOrder,
  archiveOrder,
  updateEasyShipOrderStatus,
  handlePayment,
  getMyOrders,
  getShippedOrdersByDateRange,
  searchShippedOrder,
  getShippedOrders,
  getOrdersByDateRange,
  returnAdjust,
  deleteOrder,
  deleteAdminOrder,
  updatePermaAndTemp,
} = require("../controllers/easyShipOrderController");

router.get("/get-all-order", auth, getNewOrders);
router.get("/search", auth, searchAllOrders);
router.get("/my-orders", auth, getMyOrders);
router.get("/shipped/search", auth, searchShippedOrder);
router.get("/shipped", auth, getShippedOrders);
router.get("/search-by-date", getOrdersByDateRange);
router.get("/shipped/date-range", auth, getShippedOrdersByDateRange);

router.post("/create", auth, createEasyShipOrder);
router.post("/add-sku", auth, addSKUToOrder);
router.post("/pay", auth, handlePayment);
router.put("/archive", auth, archiveOrder);
router.put("/return-adjst", auth, returnAdjust);
router.put("/update-status/:orderId", auth, updateEasyShipOrderStatus);
router.put("/update-statuss/:orderId", auth, updatePermaAndTemp);
router.delete("/:orderId", deleteOrder);
router.delete("/delete/:id", deleteAdminOrder);

module.exports = router;
