import express from "express";
import {
  loginAdmin,
  getAdminProfile,
  getCustomers,
  approveCustomer,
  updateCustomerProfileImage,
  unverifyCustomer,
  deleteCustomer,
} from "../controllers/admincontroller.js";
import { getAdminGroupBookings, updateAdminGroupBookingStatus } from "../controllers/groupbookingscontroller.js";
import { protectAdmin } from "../middleware/adminAuth.js";
import { uploadSingleImage } from "../middleware/upload.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/profile", protectAdmin, getAdminProfile);
router.get("/customers", protectAdmin, getCustomers);
router.post("/customers/:id/approve", protectAdmin, uploadSingleImage, approveCustomer);
router.post("/customers/:id/profile-image", protectAdmin, uploadSingleImage, updateCustomerProfileImage);
router.patch("/customers/:id/unverify", protectAdmin, unverifyCustomer);
router.delete("/customers/:id", protectAdmin, deleteCustomer);
router.get("/inquiries", protectAdmin, getAdminGroupBookings);
router.patch("/inquiries/:id/status", protectAdmin, updateAdminGroupBookingStatus);

export default router;