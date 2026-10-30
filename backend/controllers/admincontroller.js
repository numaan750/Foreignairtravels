import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/loginuser.js";
import { sendEmail } from "../utils/sendEmail.js";
import { uploadImageBuffer } from "../utils/cloudinary.js";

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
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword || !process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: "Server configuration is incomplete. Check the environment settings." });
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

export const getCustomers = async (req, res) => {
  try {
    const customers = await User.find()
      .select("agencyname name email number city profileImage isVerified approvalEmailSentAt createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

const getApprovalEmailErrorMessage = (error) => {
  if (error?.code === "EMAIL_CONFIG_MISSING") {
    return "The account is approved, but email is not configured. Check GMAIL_USER and GMAIL_APP_PASSWORD.";
  }
  if (error?.code === "EAUTH" || error?.responseCode === 535) {
    return "The account is approved, but Gmail rejected the credentials. Check the backend email settings.";
  }
  if (["ETIMEDOUT", "ECONNECTION", "ESOCKET"].includes(error?.code)) {
    return "The account is approved, but the backend could not connect to Gmail. Retry the email from this page.";
  }
  return "The account is approved, but the confirmation email could not be sent. Retry the email from this page.";
};

export const approveCustomer = async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid customer ID." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    if (!user.isVerified) {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Upload a profile image before approving this account." });
      }

      const image = await uploadImageBuffer(req.file.buffer, "foreignairtravel/profiles");
      user.profileImage = image.url;
      user.isVerified = true;
      await user.save();
    }

    if (!user.approvalEmailSentAt) {
      try {
        await sendEmail({
          to: user.email,
          subject: "ForeignAirTravel: your account has been approved",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#003366">
              <h2>Hello ${escapeHtml(user.name)},</h2>
              <p>Your ForeignAirTravel account has been approved. You can now sign in with your email and password.</p>
            </div>
          `,
        });
        user.approvalEmailSentAt = new Date();
        await user.save();
      } catch (emailError) {
        console.error("Account approval email failed:", {
          code: emailError.code,
          responseCode: emailError.responseCode,
          command: emailError.command,
          message: emailError.message,
        });
        return res.status(502).json({
          success: false,
          approved: true,
          message: getApprovalEmailErrorMessage(emailError),
          customer: {
            _id: user._id,
            profileImage: user.profileImage,
            isVerified: user.isVerified,
            approvalEmailSentAt: user.approvalEmailSentAt || null,
          },
        });
      }
    }

    res.status(200).json({
      success: true,
      approved: true,
      message: user.approvalEmailSentAt
        ? "Customer is approved and the confirmation email has been sent."
        : "Customer is approved.",
      customer: {
        _id: user._id,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        approvalEmailSentAt: user.approvalEmailSentAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomerProfileImage = async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid customer ID." });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Select a profile image." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    const image = await uploadImageBuffer(req.file.buffer, "foreignairtravel/profiles");
    user.profileImage = image.url;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Customer profile image updated.",
      profileImage: user.profileImage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unverifyCustomer = async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid customer ID." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isVerified: false }, $unset: { approvalEmailSentAt: 1 } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    res.status(200).json({
      success: true,
      message: "Customer verification has been revoked.",
      isVerified: user.isVerified,
      approvalEmailSentAt: user.approvalEmailSentAt || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid customer ID." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    res.status(200).json({ success: true, message: "Customer account deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};