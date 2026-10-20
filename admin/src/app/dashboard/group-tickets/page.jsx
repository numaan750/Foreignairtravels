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
    createGroupTicket,
    updateGroupTicket,
    deleteGroupTicket,
  } = useApp();
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadCategories = useCallback(async () => {
    const { ok, data } = await getGroupTicketCategories();
    if (ok) setCategories(data.data);
    else setListError(data.message || "Categories load nahi ho sakin");
  }, [getGroupTicketCategories]);

  const loadTickets = useCallback(async () => {
    const { ok, data } = await getGroupTickets(categoryFilter);
    if (ok) {
      setTickets(data.data);
      setListError("");
    } else setListError(data.message || "Group tickets load nahi ho sake");
    setLoading(false);
  }, [categoryFilter, getGroupTickets]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { loadTickets(); }, [loadTickets]);

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
      setFormError(data.message || "Ticket save nahi ho saka");
      return;
    }
    setFormOpen(false);
    await loadTickets();
  };

  const handleDelete = async (ticket) => {
    if (!window.confirm(`"${ticket.groupName}" group ticket delete karna hai?`)) return;
    const { ok, data } = await deleteGroupTicket(ticket._id);
    if (!ok) {
      window.alert(data.message || "Ticket delete nahi ho saka");
      return;
    }
    await loadTickets();
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="Group Tickets" description="Har ticket ko save karte waqt uski category select karein." />
        <button onClick={() => openForm()} disabled={!categories.length} className="flex items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"><FiPlus /> Add ticket</button>
      </div>

      <label className="mb-5 block max-w-sm text-sm font-medium text-[#003366]">
        Filter by category

        <div className="relative mt-1.5">
          <select
            value={categoryFilter}
            onChange={(event) => {
              setLoading(true);
              setCategoryFilter(event.target.value);
            }}
            className="w-full appearance-none rounded-xl border border-[#003366]/15 bg-white px-4 py-2.5 pr-12 text-sm outline-none focus:border-[#FF6B35]"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#003366]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
      </label>

      {loading ? <p className="text-sm text-[#003366]/60">Loading...</p>
        : listError ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{listError}</p>
          : tickets.length === 0 ? <EmptyState icon={LuPlane} title="Abhi koi group ticket nahi" text={categories.length ? "Add ticket se pehla group ticket banayein." : "Pehle Group Ticket Categories mein category banayein."} />
            : <div className="grid gap-4 xl:grid-cols-2">
              {tickets.map((ticket) => (
                <article key={ticket._id} className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-wrap items-start gap-3">
                    {ticket.airlineLogo ? <img src={ticket.airlineLogo} alt="" className="size-12 rounded-xl border border-[#003366]/10 object-contain p-1" /> : <span className="flex size-12 items-center justify-center rounded-xl bg-[#003366]/5 text-[#003366]"><LuPlane /></span>}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#FF6B35]">{ticket.category?.name || "Category missing"}</p>
                      <h2 className="mt-1 font-semibold text-[#003366]">{ticket.groupName}</h2>
                      <p className="text-sm text-[#003366]/70">{ticket.airline} · {formatDate(ticket.departureDate)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${ticket.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{ticket.isActive ? "Active" : "Hidden"}</span>
                  </div>
                  <div className="mt-4 space-y-1 text-sm text-[#003366]/75">
                    {ticket.segments.map((segment, index) => <p key={`${segment.flightNumber}-${index}`}>{segment.from} → {segment.to} · {segment.flightNumber} · {segment.departureTime || "Time TBA"}</p>)}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#003366]">{ticket.currency} {Number(ticket.adultFare).toLocaleString()} adult · {ticket.baggage} baggage</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => openForm(ticket)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#EDEEE9] py-2 text-sm font-medium text-[#003366] hover:bg-[#003366] hover:text-white"><FiEdit2 /> Edit</button>
                    <button onClick={() => handleDelete(ticket)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 py-2 text-sm font-medium text-red-600 hover:bg-red-600 hover:text-white"><FiTrash2 /> Delete</button>
                  </div>
                </article>
              ))}
            </div>}

      {formOpen && <GroupTicketForm key={editing?._id || `new-${categories.length}`} initial={editing} categories={categories} saving={saving} error={formError} onSubmit={handleSubmit} onClose={() => setFormOpen(false)} />}
    </div>
  );
}
