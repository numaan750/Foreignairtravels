import mongoose from 'mongoose';
import GroupTicket from '../models/groupticketmodel.js';
import GroupTicketCategory from '../models/groupticketcategorymodel.js';

const makeSlug = (value) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const uniqueSlug = async (name, ignoreId = null) => {
  const base = makeSlug(name);
  let slug = base;
  let count = 1;

  while (await GroupTicketCategory.exists({ slug, _id: { $ne: ignoreId } })) {
    slug = `${base}-${count++}`;
  }
  return slug;
};

const categoryFields = (body) => {
  const fields = {};
  ['name', 'logo'].forEach((key) => {
    if (body[key] !== undefined) fields[key] = body[key];
  });
  return fields;
};

export const getGroupTicketCategories = async (req, res) => {
  try {
    const categories = await GroupTicketCategory.find().sort({ createdAt: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGroupTicketCategory = async (req, res) => {
  try {
    const fields = categoryFields(req.body);
    const item = await GroupTicketCategory.create({
      ...fields,
      slug: await uniqueSlug(fields.name),
    });
    res.status(201).json({ success: true, message: 'Category created', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateGroupTicketCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid category id' });
    }

    const updates = categoryFields(req.body);
    if (updates.name) updates.slug = await uniqueSlug(updates.name, id);
    const item = await GroupTicketCategory.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category updated', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteGroupTicketCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid category id' });
    }

    const item = await GroupTicketCategory.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Category not found' });

    const ticketCount = await GroupTicket.countDocuments({ category: id });
    if (ticketCount) {
      return res.status(409).json({
        success: false,
        message: `Move or delete the ${ticketCount} ticket(s) in this category before deleting it`,
      });
    }

    await item.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
