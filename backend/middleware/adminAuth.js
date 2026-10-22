import jwt from "jsonwebtoken";

export const protectAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authentication token is required." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token ki email abhi ki .env email se match honi chahiye
    // (email badalne par purane tokens khud invalid ho jayenge)
    const currentEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

    if (decoded.role !== "admin" || decoded.email !== currentEmail) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    req.admin = { email: decoded.email, role: decoded.role };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Authentication token is invalid or expired." });
  }
};