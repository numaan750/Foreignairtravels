import mongoose from 'mongoose';
import Package from '../models/packegesmodel.js';

const makeSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Slug already ho to peeche number laga do
const uniqueSlug = async (title, ignoreId = null) => {
  const base = makeSlug(title);
  let slug = base;
  let count = 1;

  while (await Package.exists({ slug, _id: { $ne: ignoreId } })) {
    slug = `${base}-${count++}`;
  }
  return slug;
};

// GET /api/packages  (?featured=true  ?all=true)
export const getPackages = async (req, res) => {
  try {
    const filter = {};
    if (req.query.all !== 'true') filter.isActive = { $ne: false };
    if (req.query.featured === 'true') filter.isFeatured = true;

    const packages = await Package.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/packages/:idOrSlug
export const getPackage = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const query = mongoose.isValidObjectId(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    const item = await Package.findOne(query);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/packages
export const createPackage = async (req, res) => {
  try {
    const slug = await uniqueSlug(req.body.title);
    const item = await Package.create({ ...req.body, slug });
    res.status(201).json({ success: true, message: 'Package created', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/packages/:id
export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.title) updates.slug = await uniqueSlug(updates.title, id);

    const item = await Package.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.json({ success: true, message: 'Package updated', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/packages/:id
export const deletePackage = async (req, res) => {
  try {
    const item = await Package.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.json({ success: true, message: 'Package deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};