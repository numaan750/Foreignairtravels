import User from "../models/loginuser.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NUMBER_REGEX = /^[0-9+\-\s()]{7,20}$/;
const getJwtSecret = () => process.env.JWT_SECRET || process.env.jwt_secret;

// Jo fields user apna profile khud badal sakta hai
const EDITABLE_FIELDS = ["agencyname", "name", "number", "city"];

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const getEmailErrorMessage = (error) => {
  if (error?.code === "EMAIL_CONFIG_MISSING") {
    return "Email is not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to backend/.env, then restart the backend.";
  }
  if (error?.code === "EAUTH" || error?.responseCode === 535) {
    return "Gmail rejected the credentials. Check GMAIL_USER and use a valid Google App Password in GMAIL_APP_PASSWORD.";
  }
  if (["ETIMEDOUT", "ECONNECTION", "ESOCKET"].includes(error?.code)) {
    return "The backend could not connect to Gmail. Check your internet connection and try again.";
  }
  return "The email could not be sent. Check the backend terminal for the email error and try again.";
};

// User data returned to the frontend; never include the password or tokens.
const toUserPayload = (user) => ({
  id: user._id,
  agencyname: user.agencyname,
  name: user.name,
  email: user.email,
  number: user.number,
  city: user.city,
});

// POST /api/user/register
export const register = async (req, res) => {
  try {
    const agencyname = String(req.body.agencyname || "").trim();
    const name = String(req.body.name || "").trim();
    const number = String(req.body.number || "").trim();
    const city = String(req.body.city || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!agencyname || !name || !number || !city || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Agency name, name, phone number, city, email, and password are required.",
      });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Enter a valid email address." });
    }
    if (!NUMBER_REGEX.test(number)) {
      return res.status(400).json({ success: false, message: "Enter a valid phone number." });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
    }

    const existing = await User.findOne({ email });

    if (existing && existing.isVerified) {
      return res.status(409).json({ success: false, message: "This email is already registered. Please sign in." });
    }

    // Keep an existing pending account and its password unchanged.
    if (!existing) {
      await User.create({
        agencyname,
        name,
        number,
        city,
        email,
        password: await bcrypt.hash(password, 12),
      });
    }

    res.status(201).json({
      success: true,
      message: "Registration complete. Your account is waiting for administrator approval. You will receive an email when it is approved.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/login
export const login = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select("+password");
    const passwordOk = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !passwordOk) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Your account is awaiting administrator approval. You will receive an email when it is approved.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: "user" },
      getJwtSecret(),
      { expiresIn: process.env.JWT_EXPIRES_IN || process.env.jwt_expires_in || "7d" }
    );

    res.status(200).json({ success: true, token, user: toUserPayload(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/forgot-password
export const requestPasswordReset = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Enter a valid email address." });
    }

    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "This email is not registered with an administrator-approved account. Please contact the site owner.",
      });
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    user.passwordResetCodeHash = hashToken(code);
    user.passwordResetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetAttempts = 0;
    user.passwordResetTokenHash = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: "ForeignAirTravel password reset code",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#003366">
            <h2>Password reset request</h2>
            <p>Enter this verification code to reset your password:</p>
            <p style="font-size:28px;font-weight:bold;letter-spacing:6px">${code}</p>
            <p>This code expires in 10 minutes. If you did not request a password reset, you can ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      user.passwordResetCodeHash = undefined;
      user.passwordResetCodeExpires = undefined;
      user.passwordResetAttempts = 0;
      user.passwordResetTokenHash = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save();
      console.error("Password reset email failed:", {
        code: emailError.code,
        responseCode: emailError.responseCode,
        message: emailError.message,
      });
      throw emailError;
    }

    res.status(200).json({ success: true, message: "A verification code has been sent to your registered email." });
  } catch (error) {
    res.status(500).json({ success: false, message: getEmailErrorMessage(error) });
  }
};

// POST /api/user/verify-password-reset-code
export const verifyPasswordResetCode = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const code = String(req.body.code || "").trim();

    if (!EMAIL_REGEX.test(email) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ success: false, message: "Enter the registered email and 6-digit verification code." });
    }

    const user = await User.findOneAndUpdate({
      email,
      isVerified: true,
      passwordResetCodeExpires: { $gt: new Date() },
      passwordResetAttempts: { $lt: 5 },
    }, {
      $inc: { passwordResetAttempts: 1 },
    }, {
      new: true,
    }).select("+passwordResetCodeHash +passwordResetCodeExpires +passwordResetAttempts");

    if (!user || user.passwordResetCodeHash !== hashToken(code)) {
      return res.status(400).json({ success: false, message: "The verification code is invalid or expired. Request a new code." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const verifiedUser = await User.findOneAndUpdate({
      _id: user._id,
      passwordResetCodeHash: user.passwordResetCodeHash,
      passwordResetCodeExpires: { $gt: new Date() },
      passwordResetAttempts: { $lte: 5 },
    }, {
      $set: {
        passwordResetTokenHash: hashToken(resetToken),
        passwordResetTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
      $unset: {
        passwordResetCodeHash: 1,
        passwordResetCodeExpires: 1,
        passwordResetAttempts: 1,
      },
    }, { new: true });

    if (!verifiedUser) {
      return res.status(400).json({ success: false, message: "The verification code is invalid or expired. Request a new code." });
    }

    res.status(200).json({
      success: true,
      message: "Code verified. You can now choose a new password.",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/reset-password
export const resetPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const resetToken = String(req.body.resetToken || "");
    const newPassword = String(req.body.newPassword || "");

    if (!EMAIL_REGEX.test(email) || !resetToken) {
      return res.status(400).json({ success: false, message: "A verified password reset session is required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
    }

    const password = await bcrypt.hash(newPassword, 12);
    const updatedUser = await User.findOneAndUpdate({
      email,
      isVerified: true,
      passwordResetTokenHash: hashToken(resetToken),
      passwordResetTokenExpires: { $gt: new Date() },
    }, {
      $set: { password },
      $unset: {
        passwordResetCodeHash: 1,
        passwordResetCodeExpires: 1,
        passwordResetAttempts: 1,
        passwordResetTokenHash: 1,
        passwordResetTokenExpires: 1,
      },
    }, { new: true });

    if (!updatedUser) {
      return res.status(400).json({ success: false, message: "Password reset verification has expired. Request a new code." });
    }

    res.status(200).json({ success: true, message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/user/me/password
export const updatePassword = async (req, res) => {
  try {
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Enter your current and new password." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User account not found." });
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/user/me
export const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: toUserPayload(req.user) });
};

// PUT /api/user/me (agency name, name, phone number, and city can be changed; email/password cannot)
export const updateMe = async (req, res) => {
  try {
    const updates = {};

    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        const value = String(req.body[field]).trim();
        if (!value) {
          return res.status(400).json({ success: false, message: `${field} cannot be empty.` });
        }
        updates[field] = value;
      }
    }

    if (updates.number && !NUMBER_REGEX.test(updates.number)) {
      return res.status(400).json({ success: false, message: "Enter a valid phone number." });
    }
    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, message: "Provide at least one profile field to update." });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: toUserPayload(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/user/me (password confirmation is required)
export const deleteMe = async (req, res) => {
  try {
    const password = String(req.body.password || "");
    if (!password) {
      return res.status(400).json({ success: false, message: "Enter your password to delete your account." });
    }

    const user = await User.findById(req.user.id).select("+password");
    const ok = user ? await bcrypt.compare(password, user.password) : false;

    if (!ok) {
      return res.status(401).json({ success: false, message: "Incorrect password." });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};