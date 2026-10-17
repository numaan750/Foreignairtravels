import express from "express";
import { loginAdmin, getAdminProfile } from "../controllers/admincontroller.js";
import { protectAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/profile", protectAdmin, getAdminProfile);

export default router;