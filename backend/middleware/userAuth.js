import jwt from "jsonwebtoken";
import User from "../models/loginuser.js";

const getJwtSecret = () => process.env.JWT_SECRET || process.env.jwt_secret;

export const protectUser = async (req, res, next) => {
  const secret = getJwtSecret();
  if (!secret) {
    return res.status(500).json({ success: false, message: "JWT_SECRET environment variable is required." });
  }

  let decoded;
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authentication token is required." });
    }

    const token = authHeader.slice("Bearer ".length);
    decoded = jwt.verify(token, secret);
  } catch {
    return res.status(401).json({ success: false, message: "Authentication token is invalid or expired." });
  }

  if (typeof decoded === "string" || decoded.role !== "user" || !decoded.id) {
    return res.status(403).json({ success: false, message: "User access required." });
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isVerified) {
    return res.status(401).json({ success: false, message: "User account is not approved." });
  }

  req.user = user;
  return next();
};
