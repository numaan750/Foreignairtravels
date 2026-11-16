"use client";

import { useCallback, useEffect, useState } from "react";
import { FiCopy, FiKey, FiLink, FiRefreshCw, FiTrash2, FiX } from "react-icons/fi";
import PageHeader from "@/components/dashboard/PageHeader";
import { useApp } from "@/context/AppContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const EXPORT_PATH = "/api/group-ticket-integrations/export";
const emptyConnection = { name: "", baseUrl: "", apiKey: "", category: "", sourceCategorySlug: "" };
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
    getTicketIntegrationKeys,
    createTicketIntegrationKey,
    revokeTicketIntegrationKey,
    previewTicketIntegration,
  } = useApp();
  const [categories, setCategories] = useState([]);
  const [sourceCategories, setSourceCategories] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [keys, setKeys] = useState([]);
  const [connection, setConnection] = useState(emptyConnection);
  const [editing, setEditing] = useState(null);
  const [keyName, setKeyName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingSourceCategories, setLoadingSourceCategories] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    const [categoryResult, integrationResult, keyResult] = await Promise.all([
      getGroupTicketCategories(),
      getTicketIntegrations(),
      getTicketIntegrationKeys(),
    ]);
    if (!categoryResult.ok) setError(categoryResult.data.message || "Ticket categories could not be loaded.");
    else setCategories(categoryResult.data.data);
    if (!integrationResult.ok) setError(integrationResult.data.message || "Connected websites could not be loaded.");
    else setIntegrations(integrationResult.data.data);
    if (!keyResult.ok) setError(keyResult.data.message || "API keys could not be loaded.");
    else setKeys(keyResult.data.data);
    setLoading(false);
  }, [getGroupTicketCategories, getTicketIntegrationKeys, getTicketIntegrations]);

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
    if (editing && !body.apiKey) delete body.apiKey;
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
    if (!connection.baseUrl || !connection.apiKey) {
      setError("Enter the source website URL and API key to load its categories.");
      return;
    }
    setLoadingSourceCategories(true);
    setError("");
    setNotice("");
    const result = await previewTicketIntegration({
      baseUrl: connection.baseUrl,
      apiKey: connection.apiKey,
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
      ...(field === "baseUrl" || field === "apiKey" ? { sourceCategorySlug: "" } : {}),
    }));
    if (field === "baseUrl" || field === "apiKey") setSourceCategories([]);
  };

  const startEditing = (item) => {
    setEditing(item);
    setSourceCategories(item.sourceCategorySlug
      ? [{ slug: item.sourceCategorySlug, name: item.sourceCategorySlug }]
      : []);
    setConnection({
      name: item.name,
      baseUrl: item.baseUrl,
      apiKey: "",
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

  const addApiKey = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const result = await createTicketIntegrationKey({ name: keyName });
    if (!result.ok) {
      setError(result.data.message || "API key could not be created.");
    } else {
      setNewKey(result.data.data.key);
      setKeyName("");
      setNotice(result.data.message || "API key created. Copy it now.");
      await loadData();
    }
    setSaving(false);
  };

  const revokeKey = async (key) => {
    if (!window.confirm(`Revoke API key ${key.keyPrefix}? Connected websites using it will stop syncing.`)) return;
    const result = await revokeTicketIntegrationKey(key._id);
    if (result.ok) {
      if (newKey) setNewKey("");
      await loadData();
    }
    if (!result.ok) setError(result.data.message || "API key could not be revoked.");
    else setNotice("API key revoked.");
  };

  const copyNewKey = async () => {
    try {
      await navigator.clipboard.writeText(newKey);
      setNotice("API key copied.");
    } catch {
      setError("Could not copy the key automatically. Select and copy it manually.");
    }
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
          On the source website, create a key here and paste it into the destination website connection. The key is shown only once.
        </p>
        <div className="mb-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          {/* <span className="font-semibold">Source API endpoint:</span>{" "}
          <code className="break-all">{API_URL.replace(/\/+$/, "")}{EXPORT_PATH}</code> */}
          <p className="mt-1 text-xs text-slate-500">Authorization: Bearer API key · JSON: {"{ success: true, complete: true, data: [...] }"}</p>
        </div>
        <form onSubmit={addApiKey} className="flex flex-col gap-3 sm:flex-row">
          <input
            value={keyName}
            onChange={(event) => setKeyName(event.target.value)}
            required
            maxLength={80}
            placeholder="Key name, for example Main website"
            className={inputClass}
          />
          <button disabled={saving} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#003366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#FF6B35] disabled:opacity-60">
            <FiKey /> Create API key
          </button>
        </form>
        {newKey && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
            <p className="mb-2 text-sm font-semibold text-amber-900">Copy this key now; it cannot be viewed again.</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input readOnly value={newKey} className={`${inputClass} font-mono`} />
              <button type="button" onClick={() => { void copyNewKey(); }} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-400 px-4 py-2.5 text-sm font-semibold text-amber-900">
                <FiCopy /> Copy
              </button>
            </div>
          </div>
        )}
        {keys.length > 0 && (
          <div className="mt-5 space-y-2">
            {keys.map((key) => (
              <div key={key._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#003366]">{key.name}</p>
                  <p className="text-xs text-slate-500">{key.keyPrefix}... · {key.isActive ? `Last used ${formatDate(key.lastUsedAt)}` : "Revoked"}</p>
                </div>
                {key.isActive && <button type="button" onClick={() => { void revokeKey(key); }} className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"><FiTrash2 /> Revoke</button>}
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
          Add the source website URL and API key created on that website. Matching category slugs are mapped automatically; the selected category is used as a fallback. Tickets sync every 15 minutes, and bookings made here stay on this website.
        </p>
        <form onSubmit={saveConnection} className="grid gap-4 sm:grid-cols-2">
          <Field label="Connection name"><input value={connection.name} onChange={(event) => updateConnection("name", event.target.value)} required maxLength={80} className={inputClass} placeholder="Partner website" /></Field>
          <Field label="Source website URL"><input type="url" value={connection.baseUrl} onChange={(event) => updateConnection("baseUrl", event.target.value)} required className={inputClass} placeholder="https://tickets.example.com" /></Field>
          <Field label={editing ? "Replace API key (optional)" : "Source API key"}><input type="password" value={connection.apiKey} onChange={(event) => updateConnection("apiKey", event.target.value)} required={!editing} autoComplete="new-password" className={inputClass} placeholder={editing ? "Leave blank to keep current key" : "Paste the key from source website"} /></Field>
          <Field label="Local ticket category">
            <select value={connection.category} onChange={(event) => updateConnection("category", event.target.value)} required className={`dropdown-select ${inputClass}`}>
              <option value="">Select category</option>
              {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
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
            {editing && !connection.apiKey && <p className="mt-1 text-xs text-slate-500">To load a different source category while editing, enter the source API key again.</p>}
          </div>
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
                      Source category: {item.sourceCategorySlug || "All categories"} · Local fallback: {item.category?.name || "Unavailable"} · {item.lastSyncCount} tickets · Last sync: {formatDate(item.lastSyncAt)}
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
