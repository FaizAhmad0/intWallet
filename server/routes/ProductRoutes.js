const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getAllProducts,
  uploadProducts,
  updateProduct,
  getAllSKUs,
} = require("../controllers/productController");

router.get("/", auth, getAllProducts);
router.get("/allsku", auth, getAllSKUs);
router.post("/upload", auth, uploadProducts);
router.put("/:id", updateProduct);

module.exports = router;
