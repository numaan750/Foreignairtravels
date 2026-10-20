import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        agencyname: { type: String, required: true, trim: true },
        name: { type: String, required: true, trim: true },
        number: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        isVerified: { type: Boolean, default: false },
        verificationTokenHash: { type: String, select: false },
        verificationTokenExpires: { type: Date, select: false },
        passwordResetCodeHash: { type: String, select: false },
        passwordResetCodeExpires: { type: Date, select: false },
        passwordResetAttempts: { type: Number, default: 0, select: false },
        passwordResetTokenHash: { type: String, select: false },
        passwordResetTokenExpires: { type: Date, select: false },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);