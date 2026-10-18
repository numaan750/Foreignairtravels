import express from 'express';
import { protectAdmin } from '../middleware/adminAuth.js';
import {
  createAirline,
  deleteAirline,
  getAirline,
  getAirlines,
  updateAirline,
} from '../controllers/airlinescontroller.js';

const router = express.Router();

// Public (website ke liye)
router.get('/', getAirlines);
router.get('/:id', getAirline);

// Admin only
router.post('/', protectAdmin, createAirline);
router.put('/:id', protectAdmin, updateAirline);
router.delete('/:id', protectAdmin, deleteAirline);

export default router;