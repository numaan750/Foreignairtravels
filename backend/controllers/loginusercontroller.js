import User from "../models/loginuser.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NUMBER_REGEX = /^[0-9+\-\s()]{7,20}$/;
const TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 ghante
const getJwtSecret = () => process.env.JWT_SECRET || process.env.jwt_secret;

// Jo fields user apna profile khud badal sakta hai
const EDITABLE_FIELDS = ["agencyname", "name", "number", "city"];

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const getEmailErrorMessage = (error) => {
  if (error?.code === "EMAIL_CONFIG_MISSING") {
    return "Email is not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to backend/.env, then restart the backend.";
  }
  if (error?.code === "APPROVAL_CONFIG_MISSING") {
    return "Approval email is not configured. Add GMAIL_USER and CLIENT_URL to backend/.env, then restart the backend.";
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

// Naya token banao, uska hash user mein save karo, aur email bhejo
const sendAdminApprovalEmail = async (user) => {
  const clientUrl = process.env.CLIENT_URL?.replace(/\/$/, "");
  const ownerEmail = process.env.GMAIL_USER?.trim();
  if (!clientUrl || !ownerEmail) {
    const error = new Error("CLIENT_URL and GMAIL_USER environment variables are required");
    error.code = "APPROVAL_CONFIG_MISSING";
    throw error;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");

  user.verificationTokenHash = hashToken(rawToken);
  user.verificationTokenExpires = new Date(Date.now() + TOKEN_LIFETIME_MS);
  await user.save();

  const link = `${clientUrl}/verify-email?token=${rawToken}`;

  await sendEmail({
    to: ownerEmail,
    subject: "TravelNetWorth: new user account approval required",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#003366">
        <h2>New account awaiting your approval</h2>
        <p>A user has registered on the website. Review the account details below and click the button to approve it.</p>
        <p><strong>Agency:</strong> ${escapeHtml(user.agencyname)}</p>
        <p><strong>Name:</strong> ${escapeHtml(user.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(user.number)}</p>
        <p><strong>City:</strong> ${escapeHtml(user.city)}</p>
        <p style="margin:28px 0">
          <a href="${link}" style="background:#FF6B35;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
            Approve User Account
          </a>
        </p>
        <p style="font-size:13px;color:#555">This approval link is valid for 24 hours. If you do not want to approve this account, you can ignore this email.</p>
      </div>
    `,
  });
};

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

    // Unverified user dobara register kare to password na badlo, bas email dobara bhejo
    const user =
      existing ||
      (await User.create({
        agencyname,
        name,
        number,
        city,
        email,
        password: await bcrypt.hash(password, 12),
      }));

    try {
      await sendAdminApprovalEmail(user);
    } catch (mailError) {
      console.error("Admin approval email failed:", {
        code: mailError.code,
        responseCode: mailError.responseCode,
        command: mailError.command,
        message: mailError.message,
      });
      return res.status(500).json({
        success: false,
        message: getEmailErrorMessage(mailError),
      });
    }

    res.status(201).json({
      success: true,
      message: "Registration complete. Your approval request has been sent to the administrator. You will receive an email after approval and can then sign in.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/verify-email
export const verifyEmail = async (req, res) => {
  try {
    const token = String(req.body.token || "");
    if (!token) {
      return res.status(400).json({ success: false, message: "Approval token is required." });
    }

    const user = await User.findOne({
      verificationTokenHash: hashToken(token),
      verificationTokenExpires: { $gt: new Date() },
    }).select("+verificationTokenHash +verificationTokenExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This approval link is invalid, expired, or has already been used.",
      });
    }

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    res.status(200).json({ success: true, message: "Account approved." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/approval-notification
export const sendApprovalNotification = async (req, res) => {
  try {
    const token = String(req.body.token || "");
    if (!token) {
      return res.status(400).json({ success: false, message: "Approval token is required." });
    }

    const user = await User.findOne({
      verificationTokenHash: hashToken(token),
      verificationTokenExpires: { $gt: new Date() },
      isVerified: true,
    }).select("+verificationTokenHash +verificationTokenExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This approval link is invalid, expired, or has already been used.",
      });
    }

    await sendEmail({
      to: user.email,
      subject: "TravelNetWorth: your account has been approved",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#003366">
          <h2>Hello ${escapeHtml(user.name)},</h2>
          <p>Your TravelNetWorth account has been approved. You can now sign in with your email and password.</p>
        </div>
      `,
    });

    user.verificationTokenHash = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Approval confirmation email sent." });
  } catch (error) {
    console.error("Account approval email failed:", {
      code: error.code,
      responseCode: error.responseCode,
      command: error.command,
      message: error.message,
    });
    res.status(500).json({ success: false, message: getEmailErrorMessage(error) });
  }
};

// POST /api/user/resend-verification
export const resendVerification = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: "Email address is required." });
    }

    const user = await User.findOne({ email });

    if (user?.isVerified) {
      return res.status(200).json({
        success: true,
        code: "ACCOUNT_ALREADY_APPROVED",
        message: "Your account has been approved. You can now sign in with your email and password.",
      });
    }

    if (user) {
      try {
        await sendAdminApprovalEmail(user);
      } catch (mailError) {
        console.error("Admin approval email resend failed:", {
          code: mailError.code,
          responseCode: mailError.responseCode,
          command: mailError.command,
          message: mailError.message,
        });
        return res.status(500).json({
          success: false,
          message: getEmailErrorMessage(mailError),
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "If this email is registered and awaiting approval, a new approval request has been sent.",
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