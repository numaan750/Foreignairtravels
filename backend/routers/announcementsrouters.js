import express from 'express';
import { protectAdmin } from '../middleware/adminAuth.js';
import {
    createAnnouncement,
    deleteAnnouncement,
    getAllAnnouncements,
    getAnnouncements,
    updateAnnouncement,
} from '../controllers/announcementscontroller.js';

const router = express.Router();

// Public (website)
router.get('/', getAnnouncements);

// Admin panel (/admin route /:id se pehle rakha hai)
router.get('/admin', protectAdmin, getAllAnnouncements);
router.post('/', protectAdmin, createAnnouncement);
router.put('/:id', protectAdmin, updateAnnouncement);
router.delete('/:id', protectAdmin, deleteAnnouncement);

export default router;