import express from 'express';
import { protectAdmin } from '../middleware/adminAuth.js';
import {
  createService,
  deleteService,
  getService,
  getServices,
  updateService,
} from '../controllers/servicescontroller.js';

const router = express.Router();

// Public (website ke liye)
router.get('/', getServices);
router.get('/:id', getService);

// Admin only
router.post('/', protectAdmin, createService);
router.put('/:id', protectAdmin, updateService);
router.delete('/:id', protectAdmin, deleteService);

export default router;