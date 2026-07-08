const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validasi input dasar
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    // 2. Cek apakah email sudah terdaftar (Pencegahan duplikat sesuai syarat dokumen)
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    // 3. Hash Password (Keamanan)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Buat User Baru
    // CATATAN: Kita tidak memasukkan req.body.role untuk mencegah celah keamanan
    // di mana user publik mencoba mendaftar sebagai admin.
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user", // Selalu paksa jadi 'user' untuk pendaftaran publik
    });

    // 5. Kembalikan response tanpa mengirimkan password
    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Terjadi kesalahan server",
        error: error.message,
      });
  }
};
