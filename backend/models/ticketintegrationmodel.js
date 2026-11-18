import mongoose from 'mongoose';

const ticketIntegrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    baseUrl: { type: String, required: true, trim: true },
    accessEmail: { type: String, default: '', trim: true, lowercase: true },
    provider: { type: String, enum: ['foreignairtravel', 'alhaider'], default: 'foreignairtravel' },
    sourceTokenEncrypted: { type: String, default: '' },
    sourceTokenExpiresAt: { type: Date, default: null },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupTicketCategory',
      required: true,
    },
    sourceCategorySlug: { type: String, default: '', trim: true, lowercase: true },
    isActive: { type: Boolean, default: true, index: true },
    lastSyncAt: { type: Date, default: null },
    lastSyncError: { type: String, default: '' },
    lastSyncCount: { type: Number, default: 0 },
    syncLockUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

const ticketIntegrationAccessSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    isActive: { type: Boolean, default: true, index: true },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const TicketIntegration = mongoose.model('TicketIntegration', ticketIntegrationSchema);
export const TicketIntegrationAccess = mongoose.model('TicketIntegrationAccess', ticketIntegrationAccessSchema);
