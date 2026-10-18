import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema(
  {
    bankName: { type: String, required: true, trim: true },
    accountHolder: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    iban: { type: String, required: true, trim: true, uppercase: true },
    beneficiary: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    logo: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('BankAccount', bankAccountSchema);