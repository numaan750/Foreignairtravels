import mongoose from 'mongoose';
import BankAccount from '../models/bankaccountsmodel.js';

const FIELDS = ['bankName', 'accountHolder', 'accountNumber', 'iban', 'beneficiary', 'branch', 'logo'];

// Body se sirf wahi fields lo jo model mein hain
const pickFields = (body) => {
  const fields = {};
  FIELDS.forEach((key) => {
    if (body[key] !== undefined) fields[key] = body[key];
  });
  return fields;
};

// GET /api/bank-accounts
export const getBankAccounts = async (req, res) => {
  try {
    const items = await BankAccount.find().sort({ createdAt: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/bank-accounts
export const createBankAccount = async (req, res) => {
  try {
    const item = await BankAccount.create(pickFields(req.body));
    res.status(201).json({ success: true, message: 'Bank account created', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/bank-accounts/:id
export const updateBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid bank account id' });
    }

    const item = await BankAccount.findByIdAndUpdate(id, pickFields(req.body), {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Bank account not found' });
    }
    res.json({ success: true, message: 'Bank account updated', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/bank-accounts/:id
export const deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid bank account id' });
    }

    const item = await BankAccount.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Bank account not found' });
    }
    res.json({ success: true, message: 'Bank account deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};