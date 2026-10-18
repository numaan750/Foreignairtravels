import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Service', serviceSchema);