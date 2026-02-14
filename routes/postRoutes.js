const express = require("express");
const Post = require("../models/Post");
const protect = require("../middleware/authMiddleware");
const multer = require("multer");
const { storage } = require("../config/cloudinary"); // Aapki Cloudinary config file
const upload = multer({ storage });

const router = express.Router();

/* ---------------- CREATE POST WITH IMAGE ---------------- */
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const post = await Post.create({
      user: req.userId,
      caption: req.body.caption,
      // Agar image upload hui hai toh uska path lo, warna khali string
      image: req.file ? req.file.path : "" 
    });
    
    // Naye post ko populate karke bhejna taaki UI mein turant user info dikhe
    const populatedPost = await Post.findById(post._id).populate("user", "username avatar");
    
    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ... baaki routes (GET, PUT, DELETE) pehle jaise hi rahenge
module.exports = router;

/* ---------------- GET ALL POSTS ---------------- */
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json(err.message);
  }
});
/* ---------------- see a profile's post ---------------- 
router.get("/user/:userId", protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json(err.message);
  }
});*/

/* ---------------- UPDATE POST ---------------- */
router.put("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ message: "Post not found" });

    // AUTHORIZATION
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    post.caption = req.body.caption || post.caption;
    post.image = req.body.image || post.image;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ---------------- DELETE POST ---------------- */
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ message: "Post not found" });

    // AUTHORIZATION
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;
