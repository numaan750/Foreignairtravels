import mongoose from 'mongoose';

const ticketIntegrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    baseUrl: { type: String, required: true, trim: true },
    apiKeyEncrypted: { type: String, required: true },
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

const ticketIntegrationKeySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    keyHash: { type: String, required: true, unique: true },
    keyPrefix: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const TicketIntegration = mongoose.model('TicketIntegration', ticketIntegrationSchema);
export const TicketIntegrationKey = mongoose.model('TicketIntegrationKey', ticketIntegrationKeySchema);
