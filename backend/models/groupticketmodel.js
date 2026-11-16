import mongoose from 'mongoose';

const segmentSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    flightNumber: { type: String, required: true, trim: true },
    departureTime: { type: String, default: '', trim: true },
    arrivalTime: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const groupTicketSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupTicketCategory',
      required: true,
      index: true,
    },
    airlineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Airline',
      index: true,
    },
    airline: { type: String, required: true, trim: true },
    airlineLogo: { type: String, default: '' },
    groupName: { type: String, required: true, trim: true },
    departureDate: { type: Date, required: true },
    segments: { type: [segmentSchema], required: true, validate: [(items) => items.length > 0, 'At least one flight segment is required'] },
    baggage: { type: String, required: true, trim: true },
    mealAvailable: { type: Boolean, default: false },
    adultFare: { type: Number, required: true, min: 0 },
    childFare: { type: Number, default: 0, min: 0 },
    infantFare: { type: Number, default: 0, min: 0 },
    infantPriceOnCall: { type: Boolean, default: false },
    currency: { type: String, default: 'SAR', trim: true, uppercase: true },
    bookingUrl: { type: String, default: '', trim: true },
    sourceIntegration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TicketIntegration',
      default: undefined,
      index: true,
    },
    sourceTicketId: { type: String, default: undefined },
    sourceFares: {
      adultFare: { type: Number, default: 0 },
      childFare: { type: Number, default: 0 },
      infantFare: { type: Number, default: 0 },
    },
    sourceCurrency: { type: String, default: 'SAR' },
    currencyOverride: { type: Boolean, default: false },
    priceOverrides: {
      adultFare: { type: Boolean, default: false },
      childFare: { type: Boolean, default: false },
      infantFare: { type: Boolean, default: false },
    },
    sourceAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true, index: true },
    reservedBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupBooking', default: null },
  },
  { timestamps: true }
);

groupTicketSchema.index(
  { sourceIntegration: 1, sourceTicketId: 1 },
  { unique: true, partialFilterExpression: { sourceIntegration: { $type: 'objectId' } } }
);

export default mongoose.model('GroupTicket', groupTicketSchema);
