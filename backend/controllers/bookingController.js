const Booking = require("../models/Booking");
const Showtime = require("../models/Showtime");
const Seat = require("../models/Seat");

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId")
      .populate("movieId")
      .populate("showtimeId");

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("userId")
      .populate("movieId")
      .populate("showtimeId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createBooking = async (req, res) => {
  try {
    const { userId, movieId, showtimeId, seats } = req.body;

    // 1. Validasi input dasar
    if (!userId || !movieId || !showtimeId || !seats || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userId, movieId, showtimeId, dan seats wajib diisi",
      });
    }

    // 2. Cek showtime ada dan aktif
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: "Showtime tidak ditemukan",
      });
    }
    if (!showtime.isActive) {
      return res.status(400).json({
        success: false,
        message: "Showtime sudah tidak aktif",
      });
    }

    // 3. Cek apakah ada kursi duplikat pada request
    const uniqueSeats = [...new Set(seats)];
    if (uniqueSeats.length !== seats.length) {
      return res.status(400).json({
        success: false,
        message: "Terdapat kursi duplikat pada request",
      });
    }

    // 4. ATOMIC: Kunci kursi sekaligus cek apakah sudah ada yang dipesan
    // findOneAndUpdate hanya berhasil jika SEMUA kursi di `seats` belum ada di bookedSeats
    const updatedShowtime = await Showtime.findOneAndUpdate(
      {
        _id: showtimeId,
        bookedSeats: { $nin: seats }, // Syarat: tidak ada kursi yang bentrok
      },
      {
        $push: { bookedSeats: { $each: seats } }, // Tambahkan semua kursi sekaligus
      },
      { new: true }
    );

    // Jika null → ada kursi yang sudah dipesan orang lain (race condition dicegah di sini)
    if (!updatedShowtime) {
      // Cari kursi mana yang sudah dipesan untuk pesan error yang informatif
      const alreadyBooked = seats.filter((seat) =>
        showtime.bookedSeats.includes(seat)
      );
      return res.status(409).json({
        success: false,
        message: "Salah satu atau lebih kursi sudah dipesan",
        conflictSeats: alreadyBooked,
      });
    }

    // 5. Hitung total harga
    const totalPrice = seats.length * showtime.price;

    // 6. Buat booking dengan status pending
    const booking = await Booking.create({
      userId,
      movieId,
      showtimeId,
      seats,
      totalPrice,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Booking berhasil dibuat. Silakan lanjutkan ke pembayaran.",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
};