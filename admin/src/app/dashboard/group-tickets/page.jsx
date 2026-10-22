"use client";

import { useCallback, useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { LuPlane } from "react-icons/lu";
import EmptyState from "@/components/dashboard/EmptyState";
import GroupTicketForm from "@/components/dashboard/GroupTicketForm";
import PageHeader from "@/components/dashboard/PageHeader";
import { useApp } from "@/context/AppContext";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function GroupTicketsPage() {
  const {
    getGroupTickets,
    getGroupTicketCategories,
    getAirlines,
    createGroupTicket,
    updateGroupTicket,
    deleteGroupTicket,
  } = useApp();
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [airlineFilter, setAirlineFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [referenceError, setReferenceError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadCategories = useCallback(async () => {
    const [categoryResult, airlineResult] = await Promise.all([
      getGroupTicketCategories(),
      getAirlines(),
    ]);
    if (categoryResult.ok) setCategories(categoryResult.data.data);
    else setReferenceError(categoryResult.data.message || "Unable to load categories.");
    if (airlineResult.ok) setAirlines(airlineResult.data.data);
    else setReferenceError(airlineResult.data.message || "Unable to load airlines.");
  }, [getAirlines, getGroupTicketCategories]);

  const loadTickets = useCallback(async () => {
    const { ok, data } = await getGroupTickets(categoryFilter);
    if (ok) {
      setTickets(airlineFilter
        ? data.data.filter((ticket) => {
          const ticketAirlineId = typeof ticket.airlineId === "object" ? ticket.airlineId?._id : ticket.airlineId;
          return ticketAirlineId === airlineFilter;
        })
        : data.data);
    } else setListError(data.message || "Unable to load group tickets.");
    setLoading(false);
  }, [airlineFilter, categoryFilter, getGroupTickets]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadCategories(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadCategories]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadTickets(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadTickets]);

  const openForm = (ticket = null) => {
    setEditing(ticket);
    setFormError("");
    setFormOpen(true);
  };

  const handleSubmit = async (body) => {
    setSaving(true);
    const { ok, data } = editing
      ? await updateGroupTicket(editing._id, body)
      : await createGroupTicket(body);
    setSaving(false);
    if (!ok) {
      setFormError(data.message || "Unable to save the ticket.");
      return;
    }
    setFormOpen(false);
    await loadTickets();
  };

  const handleDelete = async (ticket) => {
    if (!window.confirm(`Are you sure you want to delete the "${ticket.groupName}" group ticket?`)) return;
    const { ok, data } = await deleteGroupTicket(ticket._id);
    if (!ok) {
      window.alert(data.message || "Unable to delete the ticket.");
      return;
    }
    await loadTickets();
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5">
        <PageHeader title="Group Tickets" description="Select a category when saving each ticket." className="mb-0" />
        <button onClick={() => openForm()} disabled={!categories.length || !airlines.length} className="flex items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"><FiPlus /> Add ticket</button>
      </div>

      {referenceError && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{referenceError}</p>}
      {!referenceError && !airlines.length && <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Add an airline in the Airlines tab before creating group tickets for it.</p>}

      <div className="mb-5 grid max-w-3xl gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-[#003366]">
          Filter by category
          <div className="relative mt-1.5">
            <select
              value={categoryFilter}
              onChange={(event) => {
                setLoading(true);
                setCategoryFilter(event.target.value);
              }}
              className="dropdown-select w-full appearance-none rounded-xl border border-[#003366]/15 bg-white px-4 py-2.5 pr-12 text-sm outline-none focus:border-[#FF6B35]"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
        </label>

        <label className="block text-sm font-medium text-[#003366]">
          Filter by airline
          <div className="relative mt-1.5">
            <select
              value={airlineFilter}
              onChange={(event) => {
                setLoading(true);
                setAirlineFilter(event.target.value);
              }}
              className="dropdown-select w-full appearance-none rounded-xl border border-[#003366]/15 bg-white px-4 py-2.5 pr-12 text-sm outline-none focus:border-[#FF6B35]"
            >
              <option value="">All airlines</option>
              {airlines.map((airline) => (
                <option key={airline._id} value={airline._id}>{airline.name}</option>
              ))}
            </select>
          </div>
        </label>
      </div>

      {loading ? <p className="text-sm text-[#003366]/60">Loading...</p>
        : listError ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{listError}</p>
          : tickets.length === 0 ? <EmptyState icon={LuPlane} title="No group tickets yet" text={categories.length ? "Select Add ticket to create your first group ticket." : "Add a category in Group Ticket Categories first."} />
            : <div className="grid grid-cols-1 gap-3">
              {tickets.map((ticket) => (
                <article key={ticket._id} className="grid min-w-0 gap-3 rounded-xl bg-white p-3 shadow-sm sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    {ticket.airlineId?.logo || ticket.airlineLogo ? <img src={ticket.airlineId?.logo || ticket.airlineLogo} alt="" className="size-10 shrink-0 rounded-lg border border-[#003366]/10 object-contain p-1" /> : <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#003366]/5 text-[#003366]"><LuPlane /></span>}
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-medium text-[#FF6B35]">{ticket.category?.name || "Category missing"}</p>
                      <h2 className="truncate text-sm font-semibold text-[#003366]">{ticket.groupName}</h2>
                      <p className="truncate text-xs text-[#003366]/70">{ticket.airlineId?.name || ticket.airline} · {formatDate(ticket.departureDate)}</p>
                    </div>
                  </div>
                  <div className="min-w-0 space-y-0.5 text-xs text-[#003366]/75">
                    {ticket.segments.map((segment, index) => <p key={`${segment.flightNumber}-${index}`} className="truncate">{segment.from} → {segment.to} · {segment.flightNumber} · {segment.departureTime || "Time TBA"}</p>)}
                  </div>
                  <p className="truncate text-xs font-semibold text-[#003366]">{ticket.currency} {Number(ticket.adultFare).toLocaleString()} adult · {ticket.baggage} baggage</p>
                  <div className="flex gap-3 sm:w-40">
                    <button onClick={() => openForm(ticket)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#EDEEE9] px-3 py-2 text-xs font-medium text-[#003366] hover:bg-[#003366] hover:text-white"><FiEdit2 /> Edit</button>
                    <button onClick={() => handleDelete(ticket)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-600 hover:text-white"><FiTrash2 /> Delete</button>
                  </div>
                </article>
              ))}
            </div>}

      {formOpen && <GroupTicketForm key={editing?._id || `new-${categories.length}-${airlines.length}`} initial={editing} categories={categories} airlines={airlines} saving={saving} error={formError} onSubmit={handleSubmit} onClose={() => setFormOpen(false)} />}
    </div>
  );
}
