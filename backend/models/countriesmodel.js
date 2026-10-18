import mongoose from 'mongoose';

const countrySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        cities: { type: String, required: true, trim: true },
        note: { type: String, required: true, trim: true },
        flag: { type: String, required: true },
        bgImage: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model('Country', countrySchema);