import express from 'express';
import { protectAdmin } from '../middleware/adminAuth.js';
import {
  createGroupTicketCategory,
  deleteGroupTicketCategory,
  getGroupTicketCategories,
  updateGroupTicketCategory,
} from '../controllers/groupticketcategoriescontroller.js';

const router = express.Router();

router.get('/', getGroupTicketCategories);
router.post('/', protectAdmin, createGroupTicketCategory);
router.put('/:id', protectAdmin, updateGroupTicketCategory);
router.delete('/:id', protectAdmin, deleteGroupTicketCategory);

export default router;
