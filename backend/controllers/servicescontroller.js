import mongoose from 'mongoose';
import Service from '../models/servicesmodel.js';

// Body se sirf wahi fields lo jo model mein hain
const pickFields = (body) => {
  const fields = {};
  ['title', 'tagline', 'description', 'image'].forEach((key) => {
    if (body[key] !== undefined) fields[key] = body[key];
  });
  return fields;
};

// GET /api/services
export const getServices = async (req, res) => {
  try {
    // Jo pehle add hui wo pehle dikhe
    const services = await Service.find().sort({ createdAt: 1 });
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/services/:id
export const getService = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid service id' });
    }

    const item = await Service.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/services
export const createService = async (req, res) => {
  try {
    const item = await Service.create(pickFields(req.body));
    res.status(201).json({ success: true, message: 'Service created', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/services/:id
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid service id' });
    }

    const item = await Service.findByIdAndUpdate(id, pickFields(req.body), {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, message: 'Service updated', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/services/:id
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid service id' });
    }

    const item = await Service.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};