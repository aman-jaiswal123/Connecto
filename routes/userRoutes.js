const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("Working");
});

/* ================= MY PROFILE ================= */
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    const posts = await Post.find({ user: req.userId })
      .sort({ createdAt: -1 });

    res.json({ user, posts });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
