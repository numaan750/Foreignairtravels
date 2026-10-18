export default function BookingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#003366] sm:text-3xl">My Bookings</h1>
      <p className="mt-1 text-sm text-slate-600">Your bookings will appear here.</p>

      <div className="mt-6 rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
        No bookings yet.
      </div>
    </div>
  )
}