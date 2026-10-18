import mongoose from 'mongoose';
import Airline from '../models/airlinesmodel.js';

// Body se sirf wahi fields lo jo model mein hain
const pickFields = (body) => {
  const fields = {};
  ['name', 'network', 'logo'].forEach((key) => {
    if (body[key] !== undefined) fields[key] = body[key];
  });
  return fields;
};

// GET /api/airlines
export const getAirlines = async (req, res) => {
  try {
    // Jo pehle add hui wo pehle dikhe (Carrier 01, 02...)
    const airlines = await Airline.find().sort({ createdAt: 1 });
    res.json({ success: true, data: airlines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/airlines/:id
export const getAirline = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid airline id' });
    }

    const item = await Airline.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Airline not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/airlines
export const createAirline = async (req, res) => {
  try {
    const item = await Airline.create(pickFields(req.body));
    res.status(201).json({ success: true, message: 'Airline created', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/airlines/:id
export const updateAirline = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid airline id' });
    }

    const item = await Airline.findByIdAndUpdate(id, pickFields(req.body), {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Airline not found' });
    }
    res.json({ success: true, message: 'Airline updated', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/airlines/:id
export const deleteAirline = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid airline id' });
    }

    const item = await Airline.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Airline not found' });
    }
    res.json({ success: true, message: 'Airline deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};