const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getAllOrders,
  assignAwb,
  getShipment,
  getReadyToDispatchOrders,
  assignSelectedAwb,
  getInProgressOrders,
  markProductNotAvailable,
  addSKUToOrder,
  getHMIOrders,
  searchReadyToDispatchOrder,
  updateOrderStatus,
  getOrdersWithPNAStatus,
  getShippedOrders,
  getRecievedOrders,
  generateLabels,
  handlePayment,
  markAvailable,
  searchByTrackingId,
  searchPnaOrders,
  searchShippedOrder,
  searchHmiOrderByOrderId,
  searchInProgressOrderByOrderId,
  getManagerOrders,
  getTotalOrders,
  getMyOrders,
  getShippedOrdersByDateRange,
  searchOrdersByDateRange,
  markUnshipped,
  searchInProgressOrderByTrackingId,
  getAllScheduleOrders,
  updateTrackingStatus,
  searchScheduledOrders,
  schedulePickup,
  getAllArchivedOrders,
  searchArchivedOrders,
  unarchiveOrder,
  archiveOrder,
  getAllStatusOrders,
  searchAllOrders,
} = require("../controllers/orderConroller");

// router.post("/register", register);
// router.post("/login", login);
// router.post("/logoutAll", auth, logoutAll);
router.get("/all", auth, getAllOrders);
router.get("/ready-to-dispatch", auth, getReadyToDispatchOrders);
router.get("/hmi", auth, getHMIOrders);
router.get("/hmi/search", auth, searchHmiOrderByOrderId);
router.get("/in-progress", auth, getInProgressOrders);
router.get("/in-progress/search", auth, searchInProgressOrderByOrderId);
router.get(
  "/in-progress/search-trackingId",
  auth,
  searchInProgressOrderByTrackingId
);

router.get("/ready-to-dispatch/search", auth, searchReadyToDispatchOrder);
router.get("/pna", auth, getOrdersWithPNAStatus);
router.get("/pna/search", searchPnaOrders);
router.get("/shipped", auth, getShippedOrders);
router.get("/shipped/search", auth, searchShippedOrder);
router.get("/recieved", auth, getRecievedOrders);
router.get("/manager-orders", auth, getManagerOrders);
router.get("/total", auth, getTotalOrders);
router.get("/my-orders", auth, getMyOrders);
router.get("/shipped/date-range", auth, getShippedOrdersByDateRange);
router.get("/search-by-status", auth, searchOrdersByDateRange);
router.get("/schedule", auth, getAllScheduleOrders);
router.get("/schedule/search", auth, searchScheduledOrders);
router.get("/archived", auth, getAllArchivedOrders);

router.get("/archived/search", auth, searchArchivedOrders);

router.get("/getAllStatusOrder", auth, getAllStatusOrders);
router.get("/getAllStatusOrder/search", auth, searchAllOrders);

// router.get("/search", auth, searchByTrackingId);
router.post("/assign-awb", auth, assignAwb);
router.post("/assign-selected-awb", auth, assignSelectedAwb);
router.post("/add-sku", auth, addSKUToOrder);
router.post("/generate-label", auth, generateLabels);
router.post("/pay", auth, handlePayment);
router.post("/mark-available", auth, markAvailable);
router.post("/update-tracking", auth, schedulePickup);
router.post("/archive", auth, archiveOrder);
router.post("/unarchive", auth, unarchiveOrder);

router.put("/update-status/:id", auth, updateOrderStatus);
router.patch("/mark-pna", auth, markProductNotAvailable);
router.patch("/:orderId/status", auth, markUnshipped);
module.exports = router;
