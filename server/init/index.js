const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/EasyShipOrder"); // Ensure correct path to model
const axios = require("axios");
const User = require("../models/User");
const Product = require("../models/Product");

const app = express();
const PORT = 8300;

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://saumic_db_user:TIJpH0n6KJrEa3BL@cluster0.fbl838m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const createUser = async () => {
  const newUser = new User({
    name: "TL1",
    primaryContact: "8409669331",
    email: "tl1@example.com",
    password: "tl1pass",
    role: "manager",
    uid: 2,
  });

  try {
    await newUser.save();
    console.log("User saved successfully:", newUser);
  } catch (error) {
    console.error("Error saving user:", error);
  }
};

// Call the function
createUser();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // updateTrackedOrdersStatus(); // Update status
});
