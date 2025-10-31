const Product = require("../models/Product");

// POST /api/products/upload
const uploadProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Invalid or empty product list" });
    }

    // Optional: validate each product (basic check here)
    const validProducts = products.filter(
      (p) =>
        p.name &&
        p.sku &&
        p.price &&
        p.gstRate !== undefined &&
        p.dimension &&
        p.weight !== undefined &&
        p.hsn &&
        p.shipping
    );

    const insertedProducts = await Product.insertMany(validProducts);
    res
      .status(201)
      .json({ message: "Products uploaded successfully", insertedProducts });
  } catch (error) {
    console.error("Error uploading products:", error);
    res.status(500).json({ message: "Server error uploading products" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, sku = "" } = req.query;

    if (sku) {
      const product = await Product.findOne({ sku });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.json({ products: [product], total: 1 });
    }

    const total = await Product.countDocuments();
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ products, total });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error fetching products" });
  }
};

const getAllSKUs = async (req, res) => {
  try {
    const skus = await Product.find({}, { sku: 1, _id: 0 }); // Only return sku field

    res.json({ skus });
  } catch (error) {
    console.error("Error fetching SKUs:", error);
    res.status(500).json({ message: "Server error fetching SKUs" });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
};

module.exports = {
  uploadProducts,
  getAllProducts,
  updateProduct,
  getAllSKUs,
};
