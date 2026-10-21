import mongoose from 'mongoose';
import GroupBooking from '../models/groupbookingmodel.js';
import GroupTicket from '../models/groupticketmodel.js';

const bookingStatuses = ['pending', 'processing', 'on_hold', 'confirmed', 'cancelled', 'completed'];
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
  try {
    const { ticketId, passengerCounts, passengers, contactPhone } = req.body;
    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({ success: false, message: 'Select a valid group ticket.' });
    }

    const counts = {
      adults: Number(passengerCounts?.adults),
      children: Number(passengerCounts?.children || 0),
      infants: Number(passengerCounts?.infants || 0),
    };
    if (!Number.isInteger(counts.adults) || counts.adults < 1
      || !Number.isInteger(counts.children) || counts.children < 0
      || !Number.isInteger(counts.infants) || counts.infants < 0
      || counts.adults + counts.children + counts.infants > 9) {
      return res.status(400).json({ success: false, message: 'Add at least one adult. A booking can include up to 9 passengers.' });
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

    const ticket = await GroupTicket.findById(ticketId)
      .populate('category', 'name')
      .populate('airlineId', 'name logo');
    if (!ticket) return res.status(404).json({ success: false, message: 'Group ticket not found.' });

    const infantPriceOnCall = Boolean(ticket.infantPriceOnCall);
    const totalPrice = (counts.adults * ticket.adultFare)
      + (counts.children * ticket.childFare)
      + (infantPriceOnCall ? 0 : counts.infants * ticket.infantFare);

    const booking = await GroupBooking.create({
      user: req.user._id,
      ticket: ticket._id,
      ticketDetails: getTicketSnapshot(ticket),
      passengerCounts: counts,
      passengers,
      contactPhone: String(contactPhone).trim(),
      totalPrice,
      infantPriceOnCall,
    });

    res.status(201).json({
      success: true,
      message: infantPriceOnCall && counts.infants
        ? 'Booking submitted. Infant fare is on call and will be confirmed by our team.'
        : 'Booking submitted successfully.',
      data: await populateBooking(GroupBooking.findById(booking._id)).lean(),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyGroupBookings = async (req, res) => {
  try {
    const bookings = await populateBooking(GroupBooking.find({ user: req.user._id }).sort({ createdAt: -1 })).lean();
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMyGroupBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid booking id.' });
    if (!['on_hold', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'You can place a booking on hold or cancel it.' });
    }

    const booking = await GroupBooking.findOne({ _id: id, user: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(409).json({ success: false, message: 'This booking can no longer be changed.' });
    }
    booking.status = status;
    await booking.save();
    res.json({ success: true, message: `Booking ${status === 'on_hold' ? 'placed on hold' : 'cancelled'}.`, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminGroupBookings = async (req, res) => {
  try {
    const bookings = await populateBooking(GroupBooking.find().sort({ createdAt: -1 })).lean();
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminGroupBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid booking id.' });
    if (!bookingStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Select a valid booking status.' });
    }

    const booking = await GroupBooking.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    res.json({ success: true, message: 'Booking status updated.', data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
