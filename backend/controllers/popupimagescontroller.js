import mongoose from 'mongoose';
import PopupImage from '../models/popupimagesmodel.js';

// GET /api/popup-images
export const getPopupImages = async (req, res) => {
  try {
    const items = await PopupImage.find().sort({ createdAt: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/popup-images
export const createPopupImage = async (req, res) => {
  try {
    const item = await PopupImage.create({ image: req.body.image });
    res.status(201).json({ success: true, message: 'Popup image added', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/popup-images/:id
export const deletePopupImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid popup image id' });
    }

    const item = await PopupImage.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Popup image not found' });
    }
    res.json({ success: true, message: 'Popup image deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};