const express = require("express");
const User = require("../models/User");
const adminAuth = require("../middleware/adminMiddleware");

const router = express.Router();

/* ==========================
   👥 GET ALL USERS
========================== */
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select("name email workout settings createdAt");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ==========================
   ✏️ UPDATE USER SETTINGS
========================== */
router.put("/users/:id", adminAuth, async (req, res) => {
  const { autoIncrement, incrementBy } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (autoIncrement !== undefined)
    user.settings.autoIncrement = autoIncrement;
  if (incrementBy !== undefined)
    user.settings.incrementBy = incrementBy;

  await user.save();
  res.json({ message: "User updated" });
});

/* ==========================
   ❌ DELETE USER
========================== */
router.delete("/users/:id", adminAuth, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  await user.deleteOne();
  res.json({ message: "User deleted" });
});

module.exports = router;
