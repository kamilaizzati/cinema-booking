const Movie = require("../models/Movie");
const Bioskop = require("../models/Bioskop");
const Showtime = require("../models/Showtime");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

/**
 * ==============================
 * Dashboard Admin
 * ==============================
 * Total Movie
 * Total Studio
 * Total Showtimes
 * Total Bookings
 * Total Users
 * Total Revenue
 * Recent Booking
 * Popular Movie (Count Seats)
 */
exports.getDashboard = async (req, res) => {
  try {
    const [totalMovie, totalStudio, totalShowtimes, totalBookings, totalUsers] =
      await Promise.all([
        Movie.countDocuments(),
        Bioskop.countDocuments(),
        Showtime.countDocuments(),
        Booking.countDocuments(),
        User.countDocuments(),
      ]);

    // Total Revenue
    const revenue = await Transaction.aggregate([
      {
        $match: {
          status: "success",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$amount",
          },
        },
      },
    ]);

    // Recent Booking
    const recentBookings = await Booking.find()
      .populate("userId", "name email")
      .populate("movieId", "title poster")
      .sort({ createdAt: -1 })
      .limit(5);

    // Popular Movie (berdasarkan jumlah seat terjual)
    const popularMovies = await Booking.aggregate([
      {
        $group: {
          _id: "$movieId",
          totalBookings: {
            $sum: 1,
          },
          totalSeats: {
            $sum: {
              $size: "$seats",
            },
          },
        },
      },
      {
        $sort: {
          totalSeats: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "movies",
          localField: "_id",
          foreignField: "_id",
          as: "movie",
        },
      },
      {
        $unwind: "$movie",
      },
      {
        $project: {
          movieId: "$_id",
          title: "$movie.title",
          poster: "$movie.poster",
          genre: "$movie.genre",
          totalBookings: 1,
          totalSeats: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalMovie,
        totalStudio,
        totalShowtimes,
        totalBookings,
        totalUsers,
        totalRevenue: revenue[0]?.totalRevenue || 0,
        recentBookings,
        popularMovies,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ==============================
 * Booking Dashboard
 * ==============================
 * Total Booking
 * Total Transaction Success
 * Total Transaction Pending
 * Total Revenue Booking
 */
exports.getBookingSummary = async (req, res) => {
  try {
    const [totalBooking, successTransaction, pendingTransaction] =
      await Promise.all([
        Booking.countDocuments(),
        Transaction.countDocuments({ status: "success" }),
        Transaction.countDocuments({ status: "pending" }),
      ]);

    const revenue = await Transaction.aggregate([
      {
        $match: {
          status: "success",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$amount",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBooking,
        successTransaction,
        pendingTransaction,
        totalRevenue: revenue[0]?.totalRevenue || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ==============================
 * Report Dashboard
 * ==============================
 * Today Revenue
 * Weekly Revenue
 * Now Showing
 * Active Showtimes
 */
exports.getReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const todayRevenue = await Transaction.aggregate([
      {
        $match: {
          status: "success",
          paymentDate: {
            $gte: today,
            $lt: tomorrow,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const weeklyRevenue = await Transaction.aggregate([
      {
        $match: {
          status: "success",
          paymentDate: {
            $gte: lastWeek,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const nowShowingMovies = await Showtime.countDocuments({
      isActive: true,
    });

    const activeShowtimes = await Showtime.find({ isActive: true })
      .populate("movieId", "title poster")
      .populate("bioskopId", "name");

    res.status(200).json({
      success: true,
      data: {
        todayRevenue: todayRevenue[0]?.total || 0,
        weeklyRevenue: weeklyRevenue[0]?.total || 0,
        nowShowingMovies,
        activeShowtimes,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
