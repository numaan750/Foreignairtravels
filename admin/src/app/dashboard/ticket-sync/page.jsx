"use client";

import { useCallback, useEffect, useState } from "react";
import { FiKey, FiLink, FiRefreshCw, FiTrash2, FiX } from "react-icons/fi";
import PageHeader from "@/components/dashboard/PageHeader";
import { useApp } from "@/context/AppContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const EXPORT_PATH = "/api/group-ticket-integrations/export";
const emptyConnection = { name: "", baseUrl: "", accessEmail: "", password: "", category: "", sourceCategorySlug: "" };
const inputClass = "w-full rounded-xl border border-[#003366]/15 bg-white px-3 py-2.5 text-sm text-[#003366] outline-none focus:border-[#FF6B35]";

function Field({ label, children }) {
  return <label className="block text-sm font-medium text-[#003366]">{label}<span className="mt-1.5 block">{children}</span></label>;
}

function formatDate(value) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString("en-GB");
}

export default function TicketSyncPage() {
  const {
    getGroupTicketCategories,
    getTicketIntegrations,
    createTicketIntegration,
    updateTicketIntegration,
    deleteTicketIntegration,
    syncTicketIntegration,
    getTicketAccessEmails,
    grantTicketAccessEmail,
    revokeTicketAccessEmail,
    previewTicketIntegration,
  } = useApp();
  const [categories, setCategories] = useState([]);
  const [sourceCategories, setSourceCategories] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [accessEmails, setAccessEmails] = useState([]);
  const [connection, setConnection] = useState(emptyConnection);
  const [editing, setEditing] = useState(null);
  const [accessEmailInput, setAccessEmailInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingSourceCategories, setLoadingSourceCategories] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    const [categoryResult, integrationResult, accessResult] = await Promise.all([
      getGroupTicketCategories(),
      getTicketIntegrations(),
      getTicketAccessEmails(),
    ]);
    if (!categoryResult.ok) setError(categoryResult.data.message || "Ticket categories could not be loaded.");
    else setCategories(categoryResult.data.data);
    if (!integrationResult.ok) setError(integrationResult.data.message || "Connected websites could not be loaded.");
    else setIntegrations(integrationResult.data.data);
    if (!accessResult.ok) setError(accessResult.data.message || "Access emails could not be loaded.");
    else setAccessEmails(accessResult.data.data);
    setLoading(false);
  }, [getGroupTicketCategories, getTicketAccessEmails, getTicketIntegrations]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadData(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadData]);

  const saveConnection = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const body = { ...connection };
    const result = editing
      ? await updateTicketIntegration(editing._id, body)
      : await createTicketIntegration(body);
    if (!result.ok) {
      setError(result.data.message || "The connected website could not be saved.");
    } else {
      const syncResult = editing ? await syncTicketIntegration(editing._id) : null;
      setConnection(emptyConnection);
      setEditing(null);
      setSourceCategories([]);
      await loadData();
      if (syncResult && !syncResult.ok) {
        setError(syncResult.data.message || "Connection was saved, but ticket sync failed.");
      } else {
        setNotice(syncResult?.data.message || result.data.message || "Connected website saved.");
      }
    }
    setSaving(false);
  };

  const loadSourceCategories = async () => {
    if (!connection.baseUrl || !connection.accessEmail) {
      setError("Enter the source website URL and access email to load its categories.");
      return;
    }
    setLoadingSourceCategories(true);
    setError("");
    setNotice("");
    const result = await previewTicketIntegration({
      baseUrl: connection.baseUrl,
      accessEmail: connection.accessEmail,
    });
    if (!result.ok) {
      setSourceCategories([]);
      setError(result.data.message || "Source categories could not be loaded.");
    } else {
      setSourceCategories(result.data.data);
      setNotice(`${result.data.data.length} source category(ies) loaded.`);
    }
    setLoadingSourceCategories(false);
  };

  const updateConnection = (field, value) => {
    setConnection((current) => ({
      ...current,
      [field]: value,
      ...(field === "baseUrl" || field === "accessEmail" || field === "password" ? { sourceCategorySlug: "" } : {}),
    }));
    if (field === "baseUrl" || field === "accessEmail" || field === "password") setSourceCategories([]);
  };

  const startEditing = (item) => {
    setEditing(item);
    setSourceCategories(item.sourceCategorySlug
      ? [{ slug: item.sourceCategorySlug, name: item.sourceCategorySlug }]
      : []);
    setConnection({
      name: item.name,
      baseUrl: item.baseUrl,
      accessEmail: item.accessEmail || "",
      password: "",
      category: item.category?._id || item.category || "",
      sourceCategorySlug: item.sourceCategorySlug || "",
    });
    setError("");
    setNotice("");
  };

  const syncNow = async (item) => {
    setBusyId(item._id);
    setError("");
    setNotice("");
    const result = await syncTicketIntegration(item._id);
    await loadData();
    if (result.ok) setNotice(result.data.message || "Ticket sync completed.");
    else setError(result.data.message || `Tickets from ${item.name} could not be synced.`);
    setBusyId("");
  };

  const removeConnection = async (item) => {
    if (!window.confirm(`Disable ${item.name} and hide its synced tickets? Existing bookings will be kept.`)) return;
    setBusyId(item._id);
    const result = await deleteTicketIntegration(item._id);
    await loadData();
    if (!result.ok) setError(result.data.message || "The connection could not be disabled.");
    else setNotice(result.data.message || "Connection disabled.");
    setBusyId("");
  };

  const enableConnection = async (item) => {
    setBusyId(item._id);
    setError("");
    const result = await updateTicketIntegration(item._id, { isActive: true });
    const syncResult = result.ok ? await syncTicketIntegration(item._id) : null;
    await loadData();
    if (!result.ok) setError(result.data.message || "The connection could not be enabled.");
    else if (!syncResult.ok) setError(syncResult.data.message || "The connection was enabled but its tickets could not be synced.");
    else setNotice(syncResult.data.message || "Connection enabled and synced.");
    setBusyId("");
  };

  const grantAccess = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const result = await grantTicketAccessEmail({ email: accessEmailInput });
    if (!result.ok) {
      setError(result.data.message || "Ticket access could not be given.");
    } else {
      setAccessEmailInput("");
      await loadData();
      setNotice(result.data.message || "Ticket access given.");
    }
    setSaving(false);
  };

  const revokeAccess = async (item) => {
    if (!window.confirm(`Remove ticket access for ${item.email}? Websites using this email will stop syncing.`)) return;
    const result = await revokeTicketAccessEmail(item._id);
    if (result.ok) await loadData();
    if (!result.ok) setError(result.data.message || "Ticket access could not be removed.");
    else setNotice(result.data.message || "Ticket access removed.");
  };

  return (
    <div className="space-y-7">
      <PageHeader title="Ticket Sync" description="Connect compatible ForeignAirTravel websites. Imported tickets use your selected local category and remain bookable on this website." />

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}

      <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <FiKey className="text-lg text-[#FF6B35]" />
          <h2 className="text-lg font-semibold text-[#003366]">Share tickets from this website</h2>
        </div>
        <p className="mb-4 text-sm leading-6 text-slate-600">
          Give ticket access to an email here. The other website connects using the same email. No API key is needed.
        </p>
        <div className="mb-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          {/* <span className="font-semibold">Source API endpoint:</span>{" "}
          <code className="break-all">{API_URL.replace(/\/+$/, "")}{EXPORT_PATH}</code> */}
          <p className="mt-1 text-xs text-slate-500">Access: granted email only · JSON: {"{ success: true, complete: true, data: [...] }"}</p>
        </div>
        <form onSubmit={grantAccess} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={accessEmailInput}
            onChange={(event) => setAccessEmailInput(event.target.value)}
            required
            maxLength={254}
            placeholder="Email to give access, for example partner@example.com"
            className={inputClass}
          />
          <button disabled={saving} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#003366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#FF6B35] disabled:opacity-60">
            <FiKey /> Give access
          </button>
        </form>
        {accessEmails.length > 0 && (
          <div className="mt-5 space-y-2">
            {accessEmails.map((item) => (
              <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#003366]">{item.email}</p>
                  <p className="text-xs text-slate-500">{item.isActive ? `Last used ${formatDate(item.lastUsedAt)}` : "Access removed"}</p>
                </div>
                {item.isActive && <button type="button" onClick={() => { void revokeAccess(item); }} className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"><FiTrash2 /> Revoke</button>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <FiLink className="text-lg text-[#FF6B35]" />
          <h2 className="text-lg font-semibold text-[#003366]">Connect another website</h2>
        </div>
        <p className="mb-5 text-sm leading-6 text-slate-600">
          Add the source website URL and the email that website gave ticket access to. For login websites like Al Haider, also enter that account&apos;s password once. Matching categories are mapped automatically; the selected category is used as a fallback. Tickets sync every 15 minutes, and bookings made here stay on this website.
        </p>
        <form onSubmit={saveConnection} className="grid gap-4 sm:grid-cols-2">
          <Field label="Connection name"><input value={connection.name} onChange={(event) => updateConnection("name", event.target.value)} required maxLength={80} className={inputClass} placeholder="Partner website" /></Field>
          <Field label="Source website URL"><input type="url" value={connection.baseUrl} onChange={(event) => updateConnection("baseUrl", event.target.value)} required className={inputClass} placeholder="https://tickets.example.com" /></Field>
          <Field label="Access email"><input type="email" value={connection.accessEmail} onChange={(event) => updateConnection("accessEmail", event.target.value)} required maxLength={254} className={inputClass} placeholder="Email that has ticket access on source website" /></Field>
          <Field label="Account password"><input type="password" value={connection.password} onChange={(event) => updateConnection("password", event.target.value)} maxLength={200} autoComplete="new-password" className={inputClass} placeholder={editing?.provider === "alhaider" ? "Leave blank to keep the saved login" : "Only for login websites like Al Haider"} /></Field>
          <Field label="Local ticket category">
            <select value={connection.category} onChange={(event) => updateConnection("category", event.target.value)} required className={`dropdown-select ${inputClass}`}>
              <option value="">Select category</option>
              {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
            </select>
          </Field>
          {/* Login websites (Al Haider) sync all groups; loading categories would create extra login tokens there. */}
          {!connection.password && editing?.provider !== "alhaider" && <div className="sm:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Field label="Source ticket category">
                <select
                  value={connection.sourceCategorySlug}
                  onChange={(event) => updateConnection("sourceCategorySlug", event.target.value)}
                  disabled={!sourceCategories.length}
                  className={`dropdown-select ${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50`}
                >
                  <option value="">All categories</option>
                  {sourceCategories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
                </select>
              </Field>
              <button
                type="button"
                onClick={() => { void loadSourceCategories(); }}
                disabled={loadingSourceCategories}
                className="shrink-0 rounded-xl border border-[#003366]/20 px-4 py-2.5 text-sm font-semibold text-[#003366] hover:bg-slate-50 disabled:opacity-60"
              >
                {loadingSourceCategories ? "Loading..." : "Load source categories"}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              “All categories” syncs every source category. Choose one to sync only that category. Local category is the fallback when names/slugs do not match.
            </p>
          </div>}
          {!categories.length && <p className="text-sm text-amber-700 sm:col-span-2">Create a Group Ticket Category before connecting a website.</p>}
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button disabled={saving || !categories.length} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              <FiLink /> {saving ? "Connecting..." : editing ? "Save connection" : "Connect and sync"}
            </button>
            {editing && <button type="button" onClick={() => { setEditing(null); setConnection(emptyConnection); }} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700"><FiX /> Cancel edit</button>}
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#003366]">Connected websites</h2>
        {loading ? <p className="rounded-xl bg-white p-5 text-sm text-slate-500">Loading connections...</p>
          : integrations.length === 0 ? <p className="rounded-xl bg-white p-5 text-sm text-slate-500">No websites connected yet.</p>
            : integrations.map((item) => (
              <article key={item._id} className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="break-words font-semibold text-[#003366]">{item.name}</h3>
                    <p className="mt-1 break-all text-sm text-slate-500">{item.baseUrl}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.provider === "alhaider" ? "Login email" : "Access email"}: {item.accessEmail || "Not set"}{item.loginExpiresAt ? ` · Login valid till: ${formatDate(item.loginExpiresAt)}` : ""} · Source category: {item.sourceCategorySlug || "All categories"} · Local fallback: {item.category?.name || "Unavailable"} · {item.lastSyncCount} tickets · Last sync: {formatDate(item.lastSyncAt)}
                    </p>
                    {item.lastSyncError && <p role="alert" className="mt-2 text-sm text-red-700">Sync error: {item.lastSyncError}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={busyId === item._id || !item.isActive} onClick={() => { void syncNow(item); }} className="inline-flex items-center gap-1.5 rounded-lg bg-[#003366] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
                      <FiRefreshCw /> {busyId === item._id ? "Syncing..." : "Sync now"}
                    </button>
                    <button type="button" disabled={!item.isActive} onClick={() => startEditing(item)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-[#003366] disabled:opacity-50">Edit</button>
                    {item.isActive && <button type="button" disabled={busyId === item._id} onClick={() => { void removeConnection(item); }} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"><FiTrash2 /> Disable</button>}
                    {!item.isActive && <button type="button" disabled={busyId === item._id} onClick={() => { void enableConnection(item); }} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-50">{busyId === item._id ? "Enabling..." : "Enable"}</button>}
                  </div>
                </div>
              </article>
            ))}
      </section>
    </div>
  );
}
