const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    // 1️⃣ Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, sub, picture } = ticket.getPayload();

    // 2️⃣ Check if user already exists
    let user = await User.findOne({ email });

    // 3️⃣ If NOT exists → create user
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        picture,
      });
      console.log("✅ New user saved:", email);
    } else {
      console.log("ℹ️ Existing user logged in:", email);
    }

    // 4️⃣ Generate JWT
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token: jwtToken,
      user,
    });

  } catch (error) {
    console.error("Auth error:", error);
    res.status(400).json({ message: "Authentication failed" });
  }
});

module.exports = router;
