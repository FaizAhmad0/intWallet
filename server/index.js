const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const PORT = process.env.PORT || 7000;
const loginRoute = require("./routes/LouginRoutes");
const adminRoutes = require("./routes/adminRoutes");
const managerRoutes = require("./routes/managerRoutes");
const walletRoutes = require("./routes/walletRoutes");
const orderRoutes = require("./routes/orderRoutes");
const easyShipOrderRoutes = require("./routes/EasyShipOrderRoute");
const productRoutes = require("./routes/ProductRoutes");
const cookieParser = require("cookie-parser");
const { scheduleShiprocketFetch } = require("./controllers/orderConroller");
const { logoutAll } = require("./controllers/userController");

dotenv.config();
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use("/login", loginRoute);
app.post("/callbackurl", (req, res) => {
  try {
    console.log("------ callbackurl request ------");
    const xGlToken =
      req.body["x-gl-token"] ||
      req.headers["x-gl-token"] ||
      req.query["x-gl-token"];

    if (!xGlToken) {
      console.error("Missing x-gl-token");
      // return res.redirect(
      //   "http://localhost:8080/#/payment-failure?reason=Missing+payment+token"
      // );
    }

    const parts = xGlToken.split(".");

    const base64urlToBase64 = (str) => {
      const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
      return b64.padEnd(Math.ceil(b64.length / 4) * 4, "=");
    };

    const payloadB64 = base64urlToBase64(parts[1]);
    const payloadJson = Buffer.from(payloadB64, "base64").toString("utf8");
    const decoded = JSON.parse(payloadJson);

    console.log("\n========== decoded response, I am testing  ==========");
    console.log(decoded);
    console.log("====i am testing ====\n");

    if (decoded.status === "SENT_FOR_CAPTURE") {
      const queryParams = new URLSearchParams({
        txnId: decoded.merchantTxnId || "N/A",
        amount: decoded.Amount || decoded.amount || "N/A",
        status: decoded.status,
        gid: decoded.gid || decoded["x-gl-gid"] || "N/A",
        paymentMethod: decoded.paymentMethod || "CARD",
      });
      console.log(
        "Would redirect to success page with:",
        queryParams.toString()
      );
      return res.redirect(`https://wallet.saumiccraft.com/wallet`);
      // return res.json({ ok: true, payload: decoded, redirectUrl: `http://localhost:8080/#/payment-success?${queryParams.toString()}` });
    } else {
      const reason =
        decoded.failureReason ||
        decoded.message ||
        `Payment status: ${decoded.status}`;
      console.log("Would redirect to failure page with reason:", reason);
      return res.redirect(
        `https://wallet.saumiccraft.com/payment-status-failed`
      );
      // return res.json({ ok: false, payload: decoded, redirectUrl: `http://localhost:8080/#/payment-failure?reason=${encodeURIComponent(reason)}&txnId=${decoded.merchantTxnId || 'N/A'}` });
    }
  } catch (err) {
    console.error("Callback error:", err.message);
    return res.redirect(`https://wallet.saumiccraft.com/payment-status-failed`);
    // return res.json({ error: 'Server error', details: err.message });
  }
});
// app.use("/payglocal/callback", payGlocal);
app.use("/admin", adminRoutes);
app.use("/manager", managerRoutes);
app.use("/user", userRoutes);
app.use("/wallet", walletRoutes);
app.use("/orders", orderRoutes);
app.use("/easyshiporders", easyShipOrderRoutes);
app.use("/products", productRoutes);
// scheduleShiprocketFetch();
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database initialized successfully");

    app.listen(PORT, () => {
      console.log(`Server Initialized on ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  });
