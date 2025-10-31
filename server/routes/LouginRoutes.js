const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OtpToken = require("../models/OtpToken");
const nodemailer = require("nodemailer");

// POST /login
router.post("/", async (req, res) => {
  const { uid: rawUid, password } = req.body;
  const uid = rawUid.replace(/^UID/, "");

  const user = await User.findOne({ uid });
  if (!user) {
    return res.status(401).json({ error: "User not found with this uid" });
  }
  const trimmedInputPassword = password.trim();
  const trimmedStoredPassword = user.password.trim();

  if (trimmedInputPassword !== trimmedStoredPassword) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  // if (!user || password !== user.password) {
  //   return res.status(401).json({ error: "Invalid credentials" });
  // }

  if (user.role === "user") {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set true in production with HTTPS
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      name: user.name,
      uid: user.uid,
      role: user.role,
      token: token,
    });
  } else {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await OtpToken.findOneAndUpdate(
      { uid },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let recipientEmail;
    if (user.role === "dispatch") {
      recipientEmail = "dispatchsaumiccraft@gmail.com";
    } else if (user.role === "accountant") {
      recipientEmail = "starcrownsaumic@gmail.com";
    } else if (user.role === "manager") {
      recipientEmail = "amazontl1@saumiccraft.in";
    } else {
      recipientEmail = "operationssaumiccraft@gmail.com";
    }

    await transporter.sendMail({
      from: `"Saumic Support" <${process.env.EMAIL_USER}>`,
      to: ["ahmadfaiz8409@gmail.com", recipientEmail],
      subject: "Your OTP Code",
      text: `Your OTP for ${user.name} ${otp}. It will expire in 5 minutes.`,
    });

    return res.json({ requiresOtp: true });
  }
});

// POST /login/verify-otp
router.post("/verify-otp", async (req, res) => {
  const { uid: rawUid, otp } = req.body;
  const uid = rawUid.replace(/^UID/, "");

  const otpEntry = await OtpToken.findOne({ uid });

  if (!otpEntry || otpEntry.otp !== otp || otpEntry.expiresAt < new Date()) {
    return res.status(401).json({ error: "Invalid or expired OTP" });
  }

  await OtpToken.deleteOne({ uid });

  const user = await User.findOne({ uid });
  if (!user) return res.status(404).json({ error: "User not found" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.json({
    message: "OTP verified and login successful",
    name: user.name,
    uid: user.uid,
    role: user.role,
    token: token,
  });
});

module.exports = router;
