import GroupBooking from '../models/groupbookingmodel.js';
import GroupTicket from '../models/groupticketmodel.js';

export const expirePendingGroupBookings = async () => {
  const now = new Date();
  const expiredBookings = await GroupBooking.find({
    status: { $ne: 'cancelled' },
    confirmedAt: { $exists: false },
    expiresAt: { $lte: now },
  })
    .select('_id ticket')
    .limit(200)
    .lean();

  let expiredCount = 0;
  for (const booking of expiredBookings) {
    const expired = await GroupBooking.findOneAndUpdate(
      {
        _id: booking._id,
        status: { $ne: 'cancelled' },
        confirmedAt: { $exists: false },
        expiresAt: { $lte: now },
      },
      { $set: { status: 'cancelled', autoCancelledAt: now } },
      { new: true }
    )
      .select('_id ticket')
      .lean();

    if (!expired) continue;

    const ticket = await GroupTicket.findOne({ _id: expired.ticket, reservedBooking: expired._id });
    if (ticket) {
      ticket.isAvailable = ticket.sourceIntegration
        ? ticket.sourceAvailable && ticket.isActive
        : true;
      ticket.reservedBooking = null;
      await ticket.save();
    }
    expiredCount += 1;
  }

  return expiredCount;
};
