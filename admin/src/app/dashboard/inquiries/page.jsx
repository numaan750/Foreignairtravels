"use client";

import { useCallback, useEffect, useState } from "react";
import { FiCalendar, FiClock, FiEye, FiMail, FiMapPin, FiPhone, FiUsers, FiX } from "react-icons/fi";
import EmptyState from "@/components/dashboard/EmptyState";
import PageHeader from "@/components/dashboard/PageHeader";
import { useApp } from "@/context/AppContext";

const bookingStatuses = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "on_hold", label: "On hold" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatFare = (currency, amount) =>
  `${currency || "SAR"} ${Number(amount || 0).toLocaleString("en-US")}`;

export default function InquiriesPage() {
  const { getInquiries, updateInquiryStatus } = useApp();
  const [inquiries, setInquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [viewingInquiry, setViewingInquiry] = useState(null);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    setLoadingError("");
    const { ok, data } = await getInquiries();
    if (ok) setInquiries(data.data);
    else setLoadingError(data.message || "Inquiries could not be loaded.");
    setLoading(false);
  }, [getInquiries]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadInquiries(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadInquiries]);

  const changeStatus = async (bookingId, status) => {
    setSavingId(bookingId);
    setActionError("");
    const { ok, data } = await updateInquiryStatus(bookingId, status);
    if (ok) {
      setInquiries((current) => current.map((inquiry) => (
        inquiry._id === bookingId ? { ...inquiry, status } : inquiry
      )));
    } else {
      setActionError(data.message || "Inquiry status could not be updated.");
    }
    setSavingId("");
  };

  const visibleInquiries = statusFilter
    ? inquiries.filter((inquiry) => inquiry.status === statusFilter)
    : inquiries;

  return (
    <div>
      <PageHeader
        title="Inquiries"
        description="Review group-ticket requests and update their booking status."
      />

      <label className="mb-5 block max-w-xs text-sm font-medium text-[#003366]">
        Filter by status
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="mt-1.5 w-full rounded-xl border border-[#003366]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#FF6B35]"
        >
          <option value="">All statuses</option>
          {bookingStatuses.map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </label>

      {actionError && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {loading ? (
        <div role="status" className="rounded-2xl bg-white p-6 text-sm text-[#003366]/60 shadow-sm">
          Loading inquiries...
        </div>
      ) : loadingError ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{loadingError}</p>
      ) : visibleInquiries.length === 0 ? (
        <EmptyState
          icon={FiUsers}
          title={inquiries.length ? "No inquiries in this status" : "No inquiries yet"}
          text={inquiries.length ? "Choose another status filter to see inquiries." : "Customer group-ticket bookings will appear here."}
        />
      ) : (
        <section aria-label={`${visibleInquiries.length} group-ticket inquiries`} className="space-y-4">
          {visibleInquiries.map((inquiry) => {
            const details = inquiry.ticketDetails;
            const customer = inquiry.user;
            return (
              <article key={inquiry._id} className="min-w-0 rounded-2xl bg-white p-3 shadow-sm sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {details.airlineLogo ? (
                      <img src={details.airlineLogo} alt="" className="size-9 shrink-0 rounded-lg border border-[#003366]/10 object-contain p-1" />
                    ) : (
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#003366]/5 text-sm font-bold text-[#003366]">
                        {details.airline?.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-[#003366]">{details.groupName}</h2>
                      <p className="truncate text-xs text-[#003366]/65">{details.airline} · {details.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="sr-only" htmlFor={`inquiry-status-${inquiry._id}`}>Booking status</label>
                    <select
                      id={`inquiry-status-${inquiry._id}`}
                      value={inquiry.status}
                      onChange={(event) => { void changeStatus(inquiry._id, event.target.value); }}
                      disabled={savingId === inquiry._id}
                      className="min-w-32 rounded-lg border border-[#003366]/15 bg-white px-3 py-2 text-xs outline-none focus:border-[#FF6B35] disabled:opacity-60"
                    >
                      {bookingStatuses.map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setViewingInquiry(inquiry)}
                      aria-label={`View passenger details for ${details.groupName}`}
                      title="View passenger details"
                      className="grid size-9 place-items-center rounded-lg border border-[#003366]/15 text-[#003366] transition hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 hover:text-[#FF6B35]"
                    >
                      <FiEye aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-x-5 gap-y-2 border-t border-[#003366]/10 pt-3 text-xs sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
                  <div className="flex min-w-0 items-center gap-1.5 text-[#003366]/75">
                    <FiUsers aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                    <span className="truncate">{customer?.name || "Customer"}{customer?.agencyname ? ` · ${customer.agencyname}` : ""}</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-1.5 text-[#003366]/75">
                    <FiMail aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                    <span className="break-all">{customer?.email || "Email unavailable"}</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-1.5 text-[#003366]/75">
                    <FiPhone aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                    <span className="truncate">{inquiry.contactPhone}</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-1.5 text-[#003366]/75">
                    <FiCalendar aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                    <span className="truncate">{formatDate(details.departureDate)}</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-1.5 text-[#003366]/75">
                    <FiClock aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                    <span className="truncate">{details.segments.map((segment) => segment.departureTime || "Time TBA").join(", ")}</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-1.5 text-[#003366]/75">
                    <FiMapPin aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                    <span className="truncate">{details.segments.map((segment) => `${segment.from} → ${segment.to}`).join(", ")}</span>
                  </div>
                  <div className="truncate text-[#003366]/75">
                    <span className="font-medium text-[#003366]">Passengers:</span>{" "}
                    {inquiry.passengerCounts.adults}A · {inquiry.passengerCounts.children}C · {inquiry.passengerCounts.infants}I
                  </div>
                  <div className="truncate font-semibold text-[#003366]">
                    <span className="font-medium">Total:</span>{" "}
                    {formatFare(details.currency, inquiry.totalPrice)}
                    {inquiry.infantPriceOnCall && inquiry.passengerCounts.infants > 0 && (
                      <span className="ml-1 font-normal text-slate-500">+ infant on call</span>
                    )}
                  </div>
                </div>

              </article>
            );
          })}
        </section>
      )}

      {viewingInquiry && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewingInquiry(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-passenger-title"
            className="my-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-[#003366]/10 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <h2 id="inquiry-passenger-title" className="truncate text-base font-semibold text-[#003366]">
                  Customer and passenger details
                </h2>
                <p className="truncate text-xs text-[#003366]/60">
                  {viewingInquiry.user?.name || "Customer"} · {viewingInquiry.user?.email || "Email unavailable"} · {viewingInquiry.ticketDetails.groupName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingInquiry(null)}
                aria-label="Close passenger details"
                className="grid size-9 shrink-0 place-items-center rounded-lg text-[#003366]/60 hover:bg-slate-100 hover:text-[#003366]"
              >
                <FiX aria-hidden="true" />
              </button>
            </header>
            <div className="max-h-[75dvh] overflow-auto p-3 sm:p-5">
              <div className="mb-3 grid gap-2 rounded-xl bg-slate-50 p-3 text-xs text-[#003366]/75 sm:grid-cols-3">
                <p><span className="font-semibold text-[#003366]">Agency:</span> {viewingInquiry.user?.agencyname || "—"}</p>
                <p><span className="font-semibold text-[#003366]">Account phone:</span> {viewingInquiry.user?.number || "—"}</p>
                <p><span className="font-semibold text-[#003366]">Booking contact:</span> {viewingInquiry.contactPhone}</p>
              </div>
              <div className="overflow-x-auto rounded-xl border border-[#003366]/10">
                <table className="w-full min-w-[920px] border-collapse text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-[#003366]/60">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">Passenger</th>
                      <th className="px-3 py-2.5 font-semibold">Gender</th>
                      <th className="px-3 py-2.5 font-semibold">Nationality</th>
                      <th className="px-3 py-2.5 font-semibold">Passport</th>
                      <th className="px-3 py-2.5 font-semibold">Date of birth</th>
                      <th className="px-3 py-2.5 font-semibold">Issue date</th>
                      <th className="px-3 py-2.5 font-semibold">Expiry date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#003366]/10 text-[#003366]/80">
                    {viewingInquiry.passengers.map((passenger, index) => (
                      <tr key={`${passenger.type}-${index}`}>
                        <td className="whitespace-nowrap px-3 py-3 font-medium text-[#003366]">
                          {passenger.title} {passenger.firstName} {passenger.lastName}
                          <span className="ml-1 text-[#003366]/50">({passenger.type})</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">{passenger.gender}</td>
                        <td className="whitespace-nowrap px-3 py-3">{passenger.nationality}</td>
                        <td className="whitespace-nowrap px-3 py-3">{passenger.passportNumber}</td>
                        <td className="whitespace-nowrap px-3 py-3">{formatDate(passenger.dateOfBirth)}</td>
                        <td className="whitespace-nowrap px-3 py-3">{formatDate(passenger.passportIssueDate)}</td>
                        <td className="whitespace-nowrap px-3 py-3">{formatDate(passenger.passportExpiry)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Submitted {formatDate(viewingInquiry.createdAt)}</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
