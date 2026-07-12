const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");
const bioskopRoutes = require("./routes/bioskopRoutes");
const movieRoutes = require("./routes/movieRoutes");

const app = express();

// Pastikan folder uploads ada
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.json());
app.use(cookieParser());

// Serve static files dari folder uploads
app.use("/uploads", express.static(uploadsDir));

app.use("/api/auth", authRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/bioskop", bioskopRoutes);
app.use("/api/movies", movieRoutes);


module.exports = app;
