import express from 'express';
import { protectAdmin } from '../middleware/adminAuth.js';
import { uploadSingleImage } from '../middleware/upload.js';
import { uploadImage } from '../controllers/uploadcontroller.js';

const router = express.Router();

// Sirf admin image upload kar sakta hai
router.post('/', protectAdmin, uploadSingleImage, uploadImage);

export default router;