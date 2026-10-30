import { uploadImageBuffer } from '../utils/cloudinary.js';

// POST /api/upload
export const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Select an image.' });
  }

  try {
    const result = await uploadImageBuffer(req.file.buffer, 'foreignairtravel/packages');
    res.status(201).json({ success: true, url: result.url, publicId: result.publicId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};