const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

// ==========================================
// LOGIN USER
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi" });
    }

    // 2. Cari user berdasarkan email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // 3. Cek kecocokan password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    // 4. Buat JWT Token
    // Payload berisi id dan role agar bisa dicek di middleware nanti
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }, // Token berlaku 1 hari
    );

    // 5. Kirim response sukses beserta token
    res.status(200).json({
      success: true,
      message: "Login berhasil",
      token,
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
        message: "Kesalahan server",
        error: error.message,
      });
  }
};

// ==========================================
// GET CURRENT USER (Get Me)
// ==========================================
// Catatan: Ini butuh authMiddleware agar req.user tersedia
exports.getMe = async (req, res) => {
  try {
    // req.user.id didapat dari middleware yang mengecek token JWT
    const user = await User.findById(req.user.id).select("-password"); // Jangan kirim password kembali!

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Kesalahan server",
        error: error.message,
      });
  }
};
