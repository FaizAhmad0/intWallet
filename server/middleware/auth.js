const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ error: "Invalid token or logged out" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token expired or invalid" });
  }
};

module.exports = auth;
