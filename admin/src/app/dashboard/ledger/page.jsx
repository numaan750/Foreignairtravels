"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiBookOpen, FiPrinter } from "react-icons/fi";
import EmptyState from "@/components/dashboard/EmptyState";
import PageHeader from "@/components/dashboard/PageHeader";
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
const getCustomerId = (booking) => booking.user?._id || booking.user || "unknown";

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
          customerId: getCustomerId(booking),
          filterDate,
          date: booking.createdAt,
          remarks: `Invoice #: ${reference} | Pax: ${passengers.length} | ${passengerNames || "Passenger details"} | Sector: ${sector || "N/A"} | Flight: ${flightNumbers || "N/A"} | Dept: ${details.departureDate ? new Date(details.departureDate).toLocaleDateString("en-GB") : "N/A"}`,
          debit: validAmount,
          credit: 0,
          currency,
        },
        {
          id: `${booking._id}-payment`,
          customerId: getCustomerId(booking),
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

  const balancesByCustomer = new Map();
  return entries.map((entry) => {
    const balances = balancesByCustomer.get(entry.customerId) || new Map();
    const balance = (balances.get(entry.currency) || 0) + entry.debit - entry.credit;
    balances.set(entry.currency, balance);
    balancesByCustomer.set(entry.customerId, balances);
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] border-collapse text-left text-[14px] text-[#153750]">
        <thead>
          <tr className="bg-[#003366] text-white">
            <th className="border border-[#003366]/20 px-3 py-2 text-center">Date</th>
            <th className="border border-[#003366]/20 px-3 py-2 text-center">Remarks</th>
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
          {[...totals.entries()].map(([currency, total]) => (
            <tr key={currency} className="font-bold">
              <td colSpan={2} className="border border-black px-3 py-2 text-right">
                Grand total ({currency})
              </td>
              <td className="whitespace-nowrap border border-black px-3 py-2 text-left">{formatMoney(currency, total.debit)}</td>
              <td className="whitespace-nowrap border border-black px-3 py-2 text-left">{formatMoney(currency, total.credit)}</td>
              <td className="whitespace-nowrap border border-black px-3 py-2 text-left">{formatMoney(currency, total.debit - total.credit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LedgerPage() {
  const { getInquiries, getCustomers } = useApp();
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerFilter, setCustomerFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLedgers = useCallback(async () => {
    setLoading(true);
    setError("");
    const [bookingsResult, customersResult] = await Promise.all([getInquiries(), getCustomers()]);
    if (!bookingsResult.ok) {
      setError(bookingsResult.data.message || "Ledger bookings could not be loaded.");
    } else if (!customersResult.ok) {
      setError(customersResult.data.message || "Customer list could not be loaded.");
    } else {
      setBookings(bookingsResult.data.data || []);
      setCustomers(customersResult.data.data || []);
    }
    setLoading(false);
  }, [getInquiries, getCustomers]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadLedgers(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadLedgers]);

  const allRows = useMemo(() => createLedgerRows(bookings), [bookings]);
  const ledgerGroups = useMemo(() => {
    const groups = new Map();
    for (const customer of customers) {
      groups.set(customer._id, { customer, rows: [] });
    }
    for (const row of allRows) {
      if (customerFilter && row.customerId !== customerFilter) continue;
      const group = groups.get(row.customerId);
      if (group) group.rows.push(row);
    }
    return [...groups.values()]
      .filter((group) => group.rows.some((row) => isInDateRange(row.filterDate, fromDate, toDate)))
      .map((group) => ({
        ...group,
        visibleRows: group.rows.filter((row) => isInDateRange(row.filterDate, fromDate, toDate)),
      }))
      .sort((first, second) => (
        `${first.customer.agencyname || ""} ${first.customer.name || ""}`
          .localeCompare(`${second.customer.agencyname || ""} ${second.customer.name || ""}`)
      ));
  }, [allRows, customers, customerFilter, fromDate, toDate]);

  const hasConfirmedBookings = allRows.some((row) => !customerFilter || row.customerId === customerFilter);

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
        <PageHeader title="Agent Ledgers" description="Review confirmed booking ledgers for all customers or one selected customer." />
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#003366] px-4 text-sm font-semibold text-white transition hover:bg-[#FF6B35]"
        >
          <FiPrinter aria-hidden="true" />
          Print ledgers
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-4 print:hidden">
        <label className="block w-full max-w-xs text-sm font-medium text-[#003366]">
          Filter by customer
          <select
            value={customerFilter}
            onChange={(event) => setCustomerFilter(event.target.value)}
            className="dropdown-select mt-1.5 w-full rounded-xl border border-[#003366]/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#FF6B35]"
          >
            <option value="">All customers</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.agencyname} — {customer.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-[#003366]">
          From
          <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="mt-1.5 block rounded-xl border border-[#003366]/15 bg-white px-3 py-2.5" />
        </label>
        <label className="block text-sm font-medium text-[#003366]">
          To
          <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="mt-1.5 block rounded-xl border border-[#003366]/15 bg-white px-3 py-2.5" />
        </label>
      </div>
      <p className="mb-4 hidden text-xs text-slate-600 print:block">
        Date Range: {fromDate || "All"} – {toDate || "All"}
      </p>

      {loading ? (
        <div role="status" className="rounded-2xl bg-white p-6 text-sm text-[#003366]/60 shadow-sm">Loading ledgers...</div>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : ledgerGroups.length === 0 ? (
        <EmptyState
          icon={FiBookOpen}
          title={hasConfirmedBookings ? "No ledgers match these filters" : "No confirmed bookings"}
          text={hasConfirmedBookings ? "Choose another customer or date range." : "Confirmed bookings will appear here. Cancelled and unconfirmed bookings are excluded."}
        />
      ) : (
        <div className="space-y-5">
          {ledgerGroups.map(({ customer, visibleRows }) => (
            <section key={customer._id} className="rounded-2xl bg-white p-4 shadow-sm sm:p-6 print:break-inside-avoid print:rounded-none print:p-0 print:shadow-none">
              <header className="mb-4 text-center">
                <h2 className="text-xl font-bold uppercase text-[#153750]">Foreign Air Travel</h2>
                <p className="text-sm font-semibold text-[#153750]">Agent Ledger</p>
                <p className="mt-1 text-sm text-[#153750]">
                  <span className="font-semibold">Agency:</span> {customer.name} {customer.city || ""}
                </p>
              </header>
              <LedgerTable rows={visibleRows} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
