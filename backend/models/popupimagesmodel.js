import mongoose from 'mongoose';

const popupImageSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('PopupImage', popupImageSchema);