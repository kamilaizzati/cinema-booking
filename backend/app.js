const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");
const bioskopRoutes = require("./routes/bioskopRoutes");
const movieRoutes = require("./routes/movieRoutes");
const seatRoutes = require("./routes/seatRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const showtimeRoutes = require("./routes/showtimeRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const studioRoutes = require("./routes/studioRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ["http://localhost:3000", "http://localhost:5173"],
  credentials: true, // izinkan cookie dikirim
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/bioskop", bioskopRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/studios", studioRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
