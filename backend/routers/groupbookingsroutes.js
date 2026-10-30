import express from 'express';
import { protectUser } from '../middleware/userAuth.js';
import {
  createGroupBooking,
  getMyGroupBookings,
  updateMyGroupBookingStatus,
  expireGroupBookings,
} from '../controllers/groupbookingscontroller.js';

const router = express.Router();

router.get('/expire-pending', (req, res, next) => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return res.status(503).json({ success: false, message: 'CRON_SECRET is not configured.' });
  }
  if (req.get('authorization') !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }
  next();
}, expireGroupBookings);
router.post('/', protectUser, createGroupBooking);
router.get('/me', protectUser, getMyGroupBookings);
router.patch('/me/:id/status', protectUser, updateMyGroupBookingStatus);

export default router;
