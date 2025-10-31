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

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use("/login", loginRoute);
app.use("/admin", adminRoutes);
app.use("/manager", managerRoutes);
app.use("/user", userRoutes);
app.use("/wallet", walletRoutes);
app.use("/orders", orderRoutes);
app.use("/easyshiporders",easyShipOrderRoutes );
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
