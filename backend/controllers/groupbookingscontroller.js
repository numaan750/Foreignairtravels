import mongoose from 'mongoose';
import GroupBooking from '../models/groupbookingmodel.js';
import GroupTicket from '../models/groupticketmodel.js';
import { expirePendingGroupBookings } from '../utils/groupBookingExpiry.js';

const bookingStatuses = ['pending', 'processing', 'on_hold', 'confirmed', 'cancelled', 'completed'];
const BOOKING_HOLD_MS = 2 * 60 * 60 * 1000;
const passengerTypes = ['adult', 'child', 'infant'];
const passengerCountFields = { adult: 'adults', child: 'children', infant: 'infants' };
const validDate = (value) => !Number.isNaN(new Date(value).getTime());

const populateBooking = (query) => query
  .populate('user', 'name email number agencyname')
  .populate('ticket', 'airline airlineLogo groupName departureDate segments baggage mealAvailable currency adultFare childFare infantFare infantPriceOnCall');

const getTicketSnapshot = (ticket) => ({
  airline: ticket.airlineId?.name || ticket.airline,
  airlineLogo: ticket.airlineId?.logo || ticket.airlineLogo || '',
  category: ticket.category?.name || 'Group ticket',
  groupName: ticket.groupName,
  departureDate: ticket.departureDate,
  segments: ticket.segments.map((segment) => ({
    from: segment.from,
    to: segment.to,
    flightNumber: segment.flightNumber,
    departureTime: segment.departureTime,
    arrivalTime: segment.arrivalTime,
  })),
  baggage: ticket.baggage,
  mealAvailable: ticket.mealAvailable,
  currency: ticket.currency,
  adultFare: ticket.adultFare,
  childFare: ticket.childFare,
  infantFare: ticket.infantFare,
  infantPriceOnCall: ticket.infantPriceOnCall,
});

export const createGroupBooking = async (req, res) => {
  let reservedTicketId;
  let bookingId;
  let bookingCreated = false;
  try {
    await expirePendingGroupBookings();
    const { ticketId, passengerCounts, passengers, contactPhone } = req.body;
    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({ success: false, message: 'Select a valid group ticket.' });
    }

    const counts = {
      adults: Number(passengerCounts?.adults),
      children: Number(passengerCounts?.children || 0),
      infants: Number(passengerCounts?.infants || 0),
    };
    if (!Number.isInteger(counts.adults) || counts.adults < 0
      || !Number.isInteger(counts.children) || counts.children < 0
      || !Number.isInteger(counts.infants) || counts.infants < 0) {
      return res.status(400).json({ success: false, message: 'Enter valid passenger counts.' });
    }
    if (counts.adults + counts.children + counts.infants === 0) {
      return res.status(400).json({ success: false, message: 'Add at least one passenger.' });
    }
    if (counts.adults === 0 && counts.children > 0 && counts.infants < 2) {
      return res.status(400).json({ success: false, message: 'A booking with a child and no adults must include at least 2 infants.' });
    }
    if (!Array.isArray(passengers) || passengers.length !== counts.adults + counts.children + counts.infants) {
      return res.status(400).json({ success: false, message: 'Passenger details must match the passenger counts.' });
    }
    if (!String(contactPhone || '').trim()) {
      return res.status(400).json({ success: false, message: 'Customer contact number is required.' });
    }
    for (const type of passengerTypes) {
      const actualCount = passengers.filter((passenger) => passenger.type === type).length;
      if (actualCount !== counts[passengerCountFields[type]]) {
        return res.status(400).json({ success: false, message: 'Passenger types must match the selected counts.' });
      }
    }
    const datesValid = passengers.every((passenger) => [
      passenger.dateOfBirth,
      passenger.passportExpiry,
      passenger.passportIssueDate,
    ].every(validDate));
    if (!datesValid) {
      return res.status(400).json({ success: false, message: 'Enter valid passenger birth and passport dates.' });
    }

    bookingId = new mongoose.Types.ObjectId();
    const reservedTicket = await GroupTicket.findOneAndUpdate(
      { _id: ticketId, isActive: true, isAvailable: { $ne: false } },
      {
        $set: {
          isAvailable: false,
          reservedBooking: bookingId,
        },
      },
      { new: true }
    );
    if (!reservedTicket) {
      const exists = await GroupTicket.exists({ _id: ticketId, isActive: true });
      return res.status(exists ? 409 : 404).json({
        success: false,
        message: exists ? 'This ticket has already been booked.' : 'Group ticket not found.',
      });
    }
    reservedTicketId = reservedTicket._id;
    const ticket = await reservedTicket.populate([
      { path: 'category', select: 'name' },
      { path: 'airlineId', select: 'name logo' },
    ]);

    const infantPriceOnCall = Boolean(ticket.infantPriceOnCall);
    const totalPrice = (counts.adults * ticket.adultFare)
      + (counts.children * ticket.childFare)
      + (infantPriceOnCall ? 0 : counts.infants * ticket.infantFare);

    const expiresAt = new Date(Date.now() + BOOKING_HOLD_MS);
    const booking = await GroupBooking.create({
      _id: bookingId,
      user: req.user._id,
      ticket: ticket._id,
      ticketDetails: getTicketSnapshot(ticket),
      passengerCounts: counts,
      passengers,
      contactPhone: String(contactPhone).trim(),
      totalPrice,
      infantPriceOnCall,
      expiresAt,
    });
    bookingCreated = true;

    res.status(201).json({
      success: true,
      message: infantPriceOnCall && counts.infants
        ? 'Booking submitted. The ticket is reserved for 2 hours while awaiting admin confirmation. Infant fare is on call.'
        : 'Booking submitted. The ticket is reserved for 2 hours while awaiting admin confirmation.',
      data: await populateBooking(GroupBooking.findById(booking._id)).lean(),
    });
  } catch (error) {
    if (reservedTicketId && bookingId && !bookingCreated) {
      await GroupTicket.updateOne(
        { _id: reservedTicketId, reservedBooking: bookingId },
        { $set: { isAvailable: true }, $unset: { reservedBooking: 1 } }
      );
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyGroupBookings = async (req, res) => {
  try {
    await expirePendingGroupBookings();
    const bookings = await populateBooking(GroupBooking.find({ user: req.user._id }).sort({ createdAt: -1 })).lean();
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMyGroupBookingStatus = async (req, res) => {
  try {
    await expirePendingGroupBookings();
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid booking id.' });
    if (status !== 'on_hold') {
      return res.status(403).json({ success: false, message: 'Only the administrator can change or cancel a booking.' });
    }

    const booking = await GroupBooking.findOne({ _id: id, user: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(409).json({ success: false, message: 'This booking can no longer be changed.' });
    }
    if (booking.expiresAt && booking.expiresAt <= new Date()) {
      return res.status(409).json({ success: false, message: 'The 2-hour booking hold has expired.' });
    }
    const updatedBooking = await GroupBooking.findOneAndUpdate(
      {
        _id: booking._id,
        user: req.user._id,
        status: booking.status,
        ...(booking.expiresAt ? { expiresAt: { $gt: new Date() } } : {}),
      },
      { $set: { status } },
      { new: true }
    );
    if (!updatedBooking) {
      await expirePendingGroupBookings();
      return res.status(409).json({ success: false, message: 'This booking can no longer be changed.' });
    }
    res.json({ success: true, message: 'Booking placed on hold.', data: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminGroupBookings = async (req, res) => {
  try {
    await expirePendingGroupBookings();
    const bookings = await populateBooking(GroupBooking.find().sort({ createdAt: -1 })).lean();
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminGroupBookingStatus = async (req, res) => {
  try {
    await expirePendingGroupBookings();
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid booking id.' });
    if (!bookingStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Select a valid booking status.' });
    }

    const currentBooking = await GroupBooking.findById(id);
    if (!currentBooking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (currentBooking.status === 'cancelled' && status !== 'cancelled') {
      return res.status(409).json({ success: false, message: 'A cancelled booking cannot be reactivated.' });
    }
    const awaitingConfirmation = !currentBooking.confirmedAt && currentBooking.status !== 'cancelled';
    if (currentBooking.expiresAt && currentBooking.expiresAt <= new Date() && awaitingConfirmation) {
      await expirePendingGroupBookings();
      return res.status(409).json({ success: false, message: 'The 2-hour booking hold has expired.' });
    }

    const booking = await GroupBooking.findOneAndUpdate(
      {
        _id: id,
        status: currentBooking.status,
        confirmedAt: currentBooking.confirmedAt,
        ...(currentBooking.expiresAt && awaitingConfirmation
          ? { expiresAt: { $gt: new Date() } }
          : {}),
      },
      {
        $set: {
          status,
          ...(status === 'confirmed' && !currentBooking.confirmedAt ? { confirmedAt: new Date() } : {}),
        },
      },
      { new: true, runValidators: true }
    );
    if (!booking) {
      await expirePendingGroupBookings();
      return res.status(409).json({ success: false, message: 'This booking status changed. Refresh and try again.' });
    }
    if (status === 'cancelled') {
      await GroupTicket.updateOne(
        { _id: booking.ticket, reservedBooking: booking._id },
        { $set: { isAvailable: true }, $unset: { reservedBooking: 1 } }
      );
    }
    res.json({ success: true, message: 'Booking status updated.', data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const expireGroupBookings = async (req, res) => {
  try {
    const expiredCount = await expirePendingGroupBookings();
    res.json({ success: true, expiredCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
