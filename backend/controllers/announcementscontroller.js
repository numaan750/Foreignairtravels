import mongoose from 'mongoose';
import Announcement from '../models/announcementsmodel.js';

const FIELDS = ['text', 'type', 'isActive'];

// Body se sirf wahi fields lo jo model mein hain
const pickFields = (body) => {
    const fields = {};
    FIELDS.forEach((key) => {
        if (body[key] !== undefined) fields[key] = body[key];
    });
    return fields;
};

// GET /api/announcements  (website: sirf active)
export const getAnnouncements = async (req, res) => {
    try {
        const items = await Announcement.find({ isActive: { $ne: false } }).sort({ createdAt: 1 });
        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/announcements/admin  (admin: sab)
export const getAllAnnouncements = async (req, res) => {
    try {
        const items = await Announcement.find().sort({ createdAt: 1 });
        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/announcements
export const createAnnouncement = async (req, res) => {
    try {
        const item = await Announcement.create(pickFields(req.body));
        res.status(201).json({ success: true, message: 'Announcement created', data: item });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// PUT /api/announcements/:id
export const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid announcement id' });
        }

        const item = await Announcement.findByIdAndUpdate(id, pickFields(req.body), {
            new: true,
            runValidators: true,
        });
        if (!item) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        res.json({ success: true, message: 'Announcement updated', data: item });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE /api/announcements/:id
export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid announcement id' });
        }

        const item = await Announcement.findByIdAndDelete(id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        res.json({ success: true, message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};