import express from 'express';
import { protectAdmin } from '../middleware/adminAuth.js';
import {
    createCountry,
    deleteCountry,
    getCountries,
    getCountry,
    updateCountry,
} from '../controllers/countriescontroller.js';

const router = express.Router();

// Public (website ke liye)
router.get('/', getCountries);
router.get('/:id', getCountry);

// Admin only
router.post('/', protectAdmin, createCountry);
router.put('/:id', protectAdmin, updateCountry);
router.delete('/:id', protectAdmin, deleteCountry);

export default router;