import express from "express";
import { loginAdmin, getAdminProfile, getCustomers } from "../controllers/admincontroller.js";
import { getAdminGroupBookings, updateAdminGroupBookingStatus } from "../controllers/groupbookingscontroller.js";
import { protectAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/profile", protectAdmin, getAdminProfile);
router.get("/customers", protectAdmin, getCustomers);
router.get("/inquiries", protectAdmin, getAdminGroupBookings);
router.patch("/inquiries/:id/status", protectAdmin, updateAdminGroupBookingStatus);

export default router;