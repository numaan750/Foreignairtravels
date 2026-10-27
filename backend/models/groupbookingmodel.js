import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['adult', 'child', 'infant'], required: true },
    title: { type: String, enum: ['Mr', 'Mrs', 'Ms', 'Master', 'Miss'], required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    passportNumber: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    passportExpiry: { type: Date, required: true },
    nationality: { type: String, required: true, trim: true },
    passportIssueDate: { type: Date, required: true },
  },
  { _id: false }
);

const groupBookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupTicket', required: true, index: true },
    ticketDetails: {
      airline: { type: String, required: true },
      airlineLogo: { type: String, default: '' },
      category: { type: String, required: true },
      groupName: { type: String, required: true },
      departureDate: { type: Date, required: true },
      segments: [{
        from: { type: String, required: true },
        to: { type: String, required: true },
        flightNumber: { type: String, required: true },
        departureTime: { type: String, default: '' },
        arrivalTime: { type: String, default: '' },
      }],
      baggage: { type: String, required: true },
      mealAvailable: { type: Boolean, default: false },
      currency: { type: String, required: true },
      adultFare: { type: Number, required: true },
      childFare: { type: Number, required: true },
      infantFare: { type: Number, required: true },
      infantPriceOnCall: { type: Boolean, default: false },
    },
    passengerCounts: {
      adults: { type: Number, required: true, min: 0 },
      children: { type: Number, required: true, min: 0 },
      infants: { type: Number, required: true, min: 0 },
    },
    passengers: { type: [passengerSchema], required: true },
    contactPhone: { type: String, required: true, trim: true },
    totalPrice: { type: Number, required: true, min: 0 },
    infantPriceOnCall: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'processing', 'on_hold', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('GroupBooking', groupBookingSchema);
