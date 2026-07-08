const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware untuk membaca JSON dan Cookies dari request
app.use(express.json());
app.use(cookieParser());

// Pendaftaran Routes
app.use("/api/auth", authRoutes);

module.exports = app;
