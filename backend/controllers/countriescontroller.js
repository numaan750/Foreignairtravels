import mongoose from 'mongoose';
import Country from '../models/countriesmodel.js';

// Body se sirf wahi fields lo jo model mein hain
const pickFields = (body) => {
    const fields = {};
    ['name', 'cities', 'note', 'flag', 'bgImage'].forEach((key) => {
        if (body[key] !== undefined) fields[key] = body[key];
    });
    return fields;
};

// GET /api/countries
export const getCountries = async (req, res) => {
    try {
        const countries = await Country.find().sort({ createdAt: 1 });
        res.json({ success: true, data: countries });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/countries/:id
export const getCountry = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid country id' });
        }

        const item = await Country.findById(id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Country not found' });
        }
        res.json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/countries
export const createCountry = async (req, res) => {
    try {
        const item = await Country.create(pickFields(req.body));
        res.status(201).json({ success: true, message: 'Country created', data: item });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// PUT /api/countries/:id
export const updateCountry = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid country id' });
        }

        const item = await Country.findByIdAndUpdate(id, pickFields(req.body), {
            new: true,
            runValidators: true,
        });
        if (!item) {
            return res.status(404).json({ success: false, message: 'Country not found' });
        }
        res.json({ success: true, message: 'Country updated', data: item });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE /api/countries/:id
export const deleteCountry = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid country id' });
        }

        const item = await Country.findByIdAndDelete(id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Country not found' });
        }
        res.json({ success: true, message: 'Country deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};