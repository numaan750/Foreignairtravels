import express from 'express';
import { protectUser } from '../middleware/userAuth.js';
import {
  createGroupBooking,
  getMyGroupBookings,
  updateMyGroupBookingStatus,
} from '../controllers/groupbookingscontroller.js';

const router = express.Router();

router.post('/', protectUser, createGroupBooking);
router.get('/me', protectUser, getMyGroupBookings);
router.patch('/me/:id/status', protectUser, updateMyGroupBookingStatus);

export default router;
