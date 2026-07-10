const mongoose = require("mongoose");

const showtimeSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie wajib dipilih"],
    },

    bioskopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bioskop",
      required: [true, "Bioskop wajib dipilih"],
    },

    studio: {
      type: String,
      required: [true, "Studio wajib diisi"],
      trim: true,
    },

    date: {
      type: Date,
      required: [true, "Tanggal wajib diisi"],
    },

    startTime: {
      type: String,
      required: [true, "Jam tayang wajib diisi"],
    },

    price: {
      type: Number,
      required: [true, "Harga tiket wajib diisi"],
      min: [0, "Harga tidak boleh negatif"],
    },

    bookedSeats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seat",
        default: [],
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Index (agar tidak bisa membuat jadwal yang sama dua kali)
showtimeSchema.index({
    movieId:1,
    bioskopId:1,
    studio:1,
    date:1,
    startTime:1
},{
    unique:true
});

module.exports = mongoose.model("Showtime", showtimeSchema);