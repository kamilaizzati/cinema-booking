const Booking = require("../models/Booking");
const Showtime = require("../models/Showtime");
const Seat = require("../models/Seat");

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId")
      .populate("movieId")
      .populate("showtimeId")
      .populate("seats"); // populate detail kursi

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
      .populate("showtimeId")
      .populate("seats"); // populate detail kursi

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
    // seats = ["A1", "A2"] — user kirim kode kursi, bukan ObjectId

    // 1. Validasi input dasar
    if (!userId || !movieId || !showtimeId || !seats || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userId, movieId, showtimeId, dan seats wajib diisi",
      });
    }

    // 2. Cek tidak ada duplikat pada request
    const uniqueSeats = [...new Set(seats)];
    if (uniqueSeats.length !== seats.length) {
      return res.status(400).json({
        success: false,
        message: "Terdapat kursi duplikat pada request",
      });
    }

    // 3. Cek showtime ada dan aktif
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

    // 4. Cari ObjectId kursi berdasarkan studioId + kode kursi yang dikirim user
    const seatDocs = await Seat.find({
      studioId: showtime.studioId,
      code: { $in: seats },
    });

    // 5. Validasi: semua kode kursi harus valid di studio ini
    if (seatDocs.length !== seats.length) {
      const validCodes = seatDocs.map((s) => s.code);
      const invalidCodes = seats.filter((s) => !validCodes.includes(s));
      return res.status(400).json({
        success: false,
        message: "Kursi tidak valid untuk studio ini",
        invalidSeats: invalidCodes,
      });
    }

    const seatIds = seatDocs.map((s) => s._id); // [ObjectId, ObjectId]

    // 6. ATOMIC: Kunci kursi pakai ObjectId — cek & update sekaligus
    const updatedShowtime = await Showtime.findOneAndUpdate(
      {
        _id: showtimeId,
        bookedSeats: { $nin: seatIds }, // Syarat: tidak ada ObjectId yang bentrok
      },
      {
        $push: { bookedSeats: { $each: seatIds } },
      },
      { new: true }
    );

    // Jika null → ada kursi yang sudah dipesan (race condition dicegah di sini)
    if (!updatedShowtime) {
      const alreadyBooked = seatDocs
        .filter((s) => showtime.bookedSeats.some((b) => b.equals(s._id)))
        .map((s) => s.code);

      return res.status(409).json({
        success: false,
        message: "Salah satu atau lebih kursi sudah dipesan",
        conflictSeats: alreadyBooked,
      });
    }

    // 7. Hitung total harga
    const totalPrice = seats.length * showtime.price;

    // 8. Buat booking dengan ObjectId kursi
    const booking = await Booking.create({
      userId,
      movieId,
      showtimeId,
      seats: seatIds, // simpan ObjectId, bukan String
      totalPrice,
      status: "pending",
    });

    // 9. Populate sebelum return agar response langsung informatif
    await booking.populate("seats");

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