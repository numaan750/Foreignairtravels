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
        profileImage: { type: String, default: "" },
        companyLogo: { type: String, default: "" },
        pendingProfileUpdate: {
            name: { type: String, trim: true },
            agencyname: { type: String, trim: true },
            number: { type: String, trim: true },
            requestedAt: { type: Date },
        },
        pendingPasswordHash: { type: String, select: false },
        hasPendingPasswordChange: { type: Boolean, default: false },
        approvalEmailSentAt: { type: Date },
        passwordResetCodeHash: { type: String, select: false },
        passwordResetCodeExpires: { type: Date, select: false },
        passwordResetAttempts: { type: Number, default: 0, select: false },
        passwordResetTokenHash: { type: String, select: false },
        passwordResetTokenExpires: { type: Date, select: false },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);