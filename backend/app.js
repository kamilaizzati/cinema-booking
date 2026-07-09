const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");

const app = express();

// Middleware untuk membaca JSON dan Cookies dari request
app.use(express.json());
app.use(cookieParser());

// Pendaftaran Routes
app.use("/api/auth", authRoutes);
app.use("/api/locations", locationRoutes);

module.exports = app;
