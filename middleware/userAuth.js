const jwt = require("jsonwebtoken");
const User = require("../models/User");

const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    // 🔥 THIS IS IMPORTANT
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { id: user._id };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = userAuth;
