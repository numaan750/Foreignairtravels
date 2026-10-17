import jwt from "jsonwebtoken";
import crypto from "crypto";

// Timing attack se bachne ke liye safe comparison
const safeEqual = (a, b) => {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

// Admin login (credentials .env se match hote hain)
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email aur password zaroori hain" });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword || !process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: "Server config incomplete hai (.env check karo)" });
    }

    const emailOk = safeEqual(email.trim().toLowerCase(), adminEmail.trim().toLowerCase());
    const passwordOk = safeEqual(password, adminPassword);

    if (!emailOk || !passwordOk) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: adminEmail.trim().toLowerCase(), role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      admin: { email: adminEmail.trim().toLowerCase(), role: "admin" },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Current admin ki info (token se)
export const getAdminProfile = async (req, res) => {
  res.status(200).json({ success: true, admin: req.admin });
};