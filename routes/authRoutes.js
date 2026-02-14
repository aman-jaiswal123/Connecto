const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const multer = require("multer");
const { storage } = require("../config/cloudinary"); // Aapki banayi config file
const upload = multer({ storage });

const router = express.Router();

// REGISTER with Optional Image
router.post("/register", upload.single("image"), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Agar image upload hui hai toh Cloudinary URL lo, varna empty string ya default avatar
    const avatarUrl = req.file ? req.file.path : "";

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      avatar: avatarUrl // Model mein avatar field hona chahiye
    });

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;
