const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
//const userRoutes = require("./routes/userRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();

// middleware
 //app.use(cors());
//https://connecto-frontend.onrender.com
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://connecto-frontend.onrender.com"
  ],
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/users", userRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API running...");
});


// DB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, "0.0.0.0", () => console.log("Server started on port 5000"));
  })
  .catch(err => console.log(err));
