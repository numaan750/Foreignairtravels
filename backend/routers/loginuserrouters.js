import express from "express";
import {
  register,
  verifyEmail,
  sendApprovalNotification,
  resendVerification,
  login,
  getMe,
  updateMe,
  deleteMe,
} from "../controllers/loginusercontroller.js";
import { protectUser } from "../middleware/userAuth.js";

const loginuserrouters = express.Router();

// Public
loginuserrouters.post("/register", register);
loginuserrouters.post("/verify-email", verifyEmail);
loginuserrouters.post("/approval-notification", sendApprovalNotification);
loginuserrouters.post("/resend-verification", resendVerification);
loginuserrouters.post("/login", login);

// Sirf login user ke liye (Bearer token chahiye)
loginuserrouters.get("/me", protectUser, getMe);
loginuserrouters.put("/me", protectUser, updateMe);
loginuserrouters.delete("/me", protectUser, deleteMe);

export default loginuserrouters;