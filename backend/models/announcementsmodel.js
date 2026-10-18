import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
    {
        text: { type: String, required: true, trim: true },
        type: { type: String, enum: ['warning', 'info'], default: 'warning' },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model('Announcement', announcementSchema);