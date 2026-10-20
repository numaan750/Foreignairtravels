import mongoose from 'mongoose';

const groupTicketCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('GroupTicketCategory', groupTicketCategorySchema);
