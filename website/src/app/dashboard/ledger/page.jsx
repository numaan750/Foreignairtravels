"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiBookOpen, FiPrinter } from "react-icons/fi";
import { useApp } from "@/context/AppContext";

const ledgerStatuses = new Set(["confirmed", "completed"]);

const formatDateTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString("sv-SE", { hour12: false }).replace("T", " ");
};

const formatMoney = (currency, amount) =>
  `${currency} ${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getReference = (booking) => booking._id.slice(-8).toUpperCase();

const createLedgerRows = (bookings) => {
  const entries = bookings
    .filter((booking) => ledgerStatuses.has(booking.status) && booking.confirmedAt && !booking.autoCancelledAt)
    .flatMap((booking) => {
      const details = booking.ticketDetails || {};
      const passengers = booking.passengers || [];
      const segments = details.segments || [];
      const passengerNames = passengers
        .map((passenger) => `${passenger.title || ""} ${passenger.firstName || ""} ${passenger.lastName || ""}`.trim())
        .filter(Boolean)
        .join(", ");
      const sector = segments.map((segment) => `${segment.from}–${segment.to}`).join(", ");
      const flightNumbers = segments.map((segment) => segment.flightNumber).filter(Boolean).join(", ");
      const reference = getReference(booking);
      const currency = details.currency || "PKR";
      const amount = Number(booking.totalPrice);
      const validAmount = Number.isFinite(amount) && amount >= 0 ? amount : 0;
      const filterDate = new Date(booking.confirmedAt).toISOString().slice(0, 10);

      return [
        {
          id: `${booking._id}-invoice`,
          bookingId: booking._id,
          filterDate,
          date: booking.createdAt,
          remarks: `Invoice #: ${reference} | Pax: ${passengers.length} | ${passengerNames || "Passenger details"} | Sector: ${sector || "N/A"} | Flight: ${flightNumbers || "N/A"} | Dept: ${details.departureDate ? new Date(details.departureDate).toLocaleDateString("en-GB") : "N/A"}`,
          debit: validAmount,
          credit: 0,
          currency,
        },
        {
          id: `${booking._id}-payment`,
          bookingId: booking._id,
          filterDate,
          date: booking.confirmedAt,
          remarks: `Payment against Invoice #: ${reference} | Remarks: Paid in full on confirmation`,
          debit: 0,
          credit: validAmount,
          currency,
        },
      ];
    })
    .sort((first, second) => new Date(first.date) - new Date(second.date));

  const balances = new Map();
  return entries.map((entry) => {
    const balance = (balances.get(entry.currency) || 0) + entry.debit - entry.credit;
    balances.set(entry.currency, balance);
    return { ...entry, balance };
  });
};

const isInDateRange = (date, fromDate, toDate) =>
  (!fromDate || date >= fromDate) && (!toDate || date <= toDate);

const getTotals = (rows) => rows.reduce((totals, row) => {
  const current = totals.get(row.currency) || { debit: 0, credit: 0 };
  current.debit += row.debit;
  current.credit += row.credit;
  totals.set(row.currency, current);
  return totals;
}, new Map());

function LedgerTable({ rows }) {
  const totals = getTotals(rows);
  const currencies = [...totals.keys()];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] border-collapse text-left text-md text-[#153750]">
        <thead>
          <tr className="bg-[#003366] text-white">
            <th className="border border-[#003366]/20 px-3 py-2 text-center">Date</th>
            <th className="border border-[#003366]/20 px-3 py-2 text-center ">Remarks</th>
            <th className="border border-[#003366]/20 px-3 py-2 text-center">Debit</th>
            <th className="border border-[#003366]/20 px-3 py-2 text-center">Credit</th>
            <th className="border border-[#003366]/20 px-3 py-2 text-center">Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="odd:bg-white even:bg-slate-50">
              <td className="whitespace-nowrap border border-black px-3 py-2">{formatDateTime(row.date)}</td>
              <td className="border border-black px-3 py-2">{row.remarks}</td>
              <td className="whitespace-nowrap border border-black px-3 py-2 text-left">{formatMoney(row.currency, row.debit)}</td>
              <td className="whitespace-nowrap border border-black px-3 py-2 text-left">{formatMoney(row.currency, row.credit)}</td>
              <td className="whitespace-nowrap border border-black px-3 py-2 text-left">{formatMoney(row.currency, row.balance)}</td>
            </tr>
          ))}
          {currencies.map((currency) => (
            <tr key={currency} className="font-bold">
              <td colSpan={2} className="border border-black px-3 py-2 text-right">
                Grand total ({currency})
              </td>
              <td className="whitespace-nowrap border border-black px-3 py-2 text-left">{formatMoney(currency, totals.get(currency).debit)}</td>
              <td className="whitespace-nowrap border border-black px-3 py-2 text-left">{formatMoney(currency, totals.get(currency).credit)}</td>
              <td className="whitespace-nowrap border border-black px-3 py-2 text-left">
                {formatMoney(currency, (totals.get(currency).debit - totals.get(currency).credit))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LedgerPage() {
  const { user, getMyGroupBookings } = useApp();
  const [bookings, setBookings] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    const result = await getMyGroupBookings();
    if (result.ok) {
      setBookings(result.data.data || []);
      setError("");
    } else {
      setError(result.data.message || "Ledger bookings could not be loaded.");
    }
    setLoading(false);
  }, [getMyGroupBookings]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadBookings(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadBookings]);

  const ledgerRows = useMemo(() => createLedgerRows(bookings), [bookings]);
  const visibleRows = ledgerRows.filter((row) => isInDateRange(row.filterDate, fromDate, toDate));

  return (
    <div id="ledger-print-area">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #ledger-print-area,
          #ledger-print-area * {
            visibility: visible !important;
          }
          #ledger-print-area {
            position: absolute;
            inset: 0;
            width: 100%;
          }
        }
      `}</style>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-[#003366]">Agent Ledger</h1>
          <p className="mt-1 text-sm text-slate-600">View confirmed bookings and their ledger entries.</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#003366] px-4 text-sm font-semibold text-white transition hover:bg-[#FF6B35]"
        >
          <FiPrinter aria-hidden="true" />
          Print ledger
        </button>
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6 print:rounded-none print:p-0 print:shadow-none">
        <header className="text-center">
          <h1 className="text-xl font-bold uppercase text-[#153750]">Foreign Air Travel</h1>
          <p className="text-sm font-semibold text-[#153750]">Agent Ledger</p>
          <p className="mt-1 text-sm text-[#153750]">
            <span className="font-semibold">Agency:</span> {user?.name || "Customer"} {user?.city || ""}
          </p>
        </header>

        <div className="my-5 flex flex-wrap items-end gap-3 print:hidden">
          <label className="text-sm font-medium text-[#003366]">
            From
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="mt-1 block rounded-lg border border-[#003366]/20 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-[#003366]">
            To
            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="mt-1 block rounded-lg border border-[#003366]/20 px-3 py-2" />
          </label>
          <p className="text-xs text-slate-500">Date range filters confirmed bookings; cancelled bookings are excluded.</p>
        </div>
        <p className="mb-2 hidden text-xs text-slate-600 print:block">
          Date Range: {fromDate || "All"} – {toDate || "All"}
        </p>

        {loading ? (
          <div role="status" className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600">Loading ledger...</div>
        ) : error ? (
          <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
        ) : visibleRows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <FiBookOpen aria-hidden="true" className="mx-auto size-8 text-[#003366]/40" />
            <h2 className="mt-3 font-semibold text-[#003366]">No confirmed bookings</h2>
            <p className="mt-1 text-sm text-slate-500">Confirmed bookings will appear here. Cancelled and unconfirmed bookings are not included.</p>
          </div>
        ) : (
          <LedgerTable rows={visibleRows} />
        )}
      </section>
    </div>
  );
}
