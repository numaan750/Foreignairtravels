import express from 'express';
import { protectAdmin } from '../middleware/adminAuth.js';
import {
  createPopupImage,
  deletePopupImage,
  getPopupImages,
} from '../controllers/popupimagescontroller.js';

const router = express.Router();

// Public (website dashboard popup)
router.get('/', getPopupImages);

// Admin only
router.post('/', protectAdmin, createPopupImage);
router.delete('/:id', protectAdmin, deletePopupImage);

export default router;