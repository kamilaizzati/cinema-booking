const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const bioskopRoutes = require("./routes/bioskopRoutes");
const movieRoutes = require("./routes/movieRoutes");

const app = express();


app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/bioskop", bioskopRoutes);
app.use("/api/movies", movieRoutes);


module.exports = app;
