import express from 'express';
import { protectAdmin } from '../middleware/adminAuth.js';
import {
  createPackage,
  deletePackage,
  getPackage,
  getPackages,
  updatePackage,
} from '../controllers/packegescontroller.js';

const router = express.Router();

// Public (website ke liye)
router.get('/', getPackages);
router.get('/:idOrSlug', getPackage);

// Admin only
router.post('/', protectAdmin, createPackage);
router.put('/:id', protectAdmin, updatePackage);
router.delete('/:id', protectAdmin, deletePackage);

export default router;