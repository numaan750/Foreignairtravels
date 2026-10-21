import mongoose from 'mongoose';
import GroupTicket from '../models/groupticketmodel.js';
import GroupTicketCategory from '../models/groupticketcategorymodel.js';
import Airline from '../models/airlinesmodel.js';

const ticketFields = (body) => {
  const fields = {};
  [
    'category',
    'airlineId',
    'airline',
    'airlineLogo',
    'groupName',
    'departureDate',
    'segments',
    'baggage',
    'mealAvailable',
    'adultFare',
    'childFare',
    'infantFare',
    'infantPriceOnCall',
    'currency',
  ].forEach((key) => {
    if (body[key] !== undefined) fields[key] = body[key];
  });
  return fields;
};

export const getGroupTickets = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) {
      let categoryItem;
      if (mongoose.isValidObjectId(category)) {
        categoryItem = await GroupTicketCategory.findById(category);
      } else {
        categoryItem = await GroupTicketCategory.findOne({ slug: category });
      }
      if (!categoryItem) {
        return res.json({ success: true, data: [] });
      }
      filter.category = categoryItem._id;
    }

    const tickets = await GroupTicket.find(filter)
      .populate('category', 'name slug logo')
      .populate('airlineId', 'name logo network')
      .sort({ departureDate: 1, createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGroupTicket = async (req, res) => {
  try {
    const fields = ticketFields(req.body);
    if (!mongoose.isValidObjectId(fields.category)) {
      return res.status(400).json({ success: false, message: 'Select a valid category' });
    }
    const category = await GroupTicketCategory.findById(fields.category);
    if (!category) return res.status(400).json({ success: false, message: 'Category not found' });

    if (!mongoose.isValidObjectId(fields.airlineId)) {
      return res.status(400).json({ success: false, message: 'Select a valid airline' });
    }
    const airline = await Airline.findById(fields.airlineId);
    if (!airline) return res.status(400).json({ success: false, message: 'Airline not found' });
    fields.airline = airline.name;
    fields.airlineLogo = airline.logo;

    const item = await GroupTicket.create(fields);
    await item.populate([
      { path: 'category', select: 'name slug logo' },
      { path: 'airlineId', select: 'name logo network' },
    ]);
    res.status(201).json({ success: true, message: 'Group ticket created', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateGroupTicket = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket id' });
    }

    const updates = ticketFields(req.body);
    if (updates.category && !mongoose.isValidObjectId(updates.category)) {
      return res.status(400).json({ success: false, message: 'Select a valid category' });
    }
    if (updates.category && !(await GroupTicketCategory.exists({ _id: updates.category }))) {
      return res.status(400).json({ success: false, message: 'Category not found' });
    }
    if (updates.airlineId) {
      if (!mongoose.isValidObjectId(updates.airlineId)) {
        return res.status(400).json({ success: false, message: 'Select a valid airline' });
      }
      const airline = await Airline.findById(updates.airlineId);
      if (!airline) return res.status(400).json({ success: false, message: 'Airline not found' });
      updates.airline = airline.name;
      updates.airlineLogo = airline.logo;
    }

    const item = await GroupTicket.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'category', select: 'name slug logo' },
      { path: 'airlineId', select: 'name logo network' },
    ]);
    if (!item) return res.status(404).json({ success: false, message: 'Group ticket not found' });
    res.json({ success: true, message: 'Group ticket updated', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteGroupTicket = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket id' });
    }
    const item = await GroupTicket.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ success: false, message: 'Group ticket not found' });
    res.json({ success: true, message: 'Group ticket deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
