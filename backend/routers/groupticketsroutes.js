import express from 'express';
import { protectAdmin } from '../middleware/adminAuth.js';
import {
  createGroupTicket,
  deleteGroupTicket,
  getGroupTickets,
  updateGroupTicket,
} from '../controllers/groupticketscontroller.js';

const router = express.Router();

router.get('/', getGroupTickets);
router.post('/', protectAdmin, createGroupTicket);
router.put('/:id', protectAdmin, updateGroupTicket);
router.delete('/:id', protectAdmin, deleteGroupTicket);

export default router;
