import express from 'express';
import { protectAdmin } from '../middleware/adminAuth.js';
import { protectUser } from '../middleware/userAuth.js';
import {
  createBankAccount,
  deleteBankAccount,
  getBankAccounts,
  updateBankAccount,
} from '../controllers/bankaccountscontroller.js';

const router = express.Router();

// Website (logged-in user)
router.get('/', protectUser, getBankAccounts);

// Admin panel
router.get('/admin', protectAdmin, getBankAccounts);
router.post('/', protectAdmin, createBankAccount);
router.put('/:id', protectAdmin, updateBankAccount);
router.delete('/:id', protectAdmin, deleteBankAccount);

export default router;