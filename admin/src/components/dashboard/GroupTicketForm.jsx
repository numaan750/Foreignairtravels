"use client";

import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";

const emptySegment = { from: "", to: "", flightNumber: "", departureTime: "", arrivalTime: "" };
const inputClass =
  "w-full rounded-xl border border-[#003366]/15 bg-white px-3 py-2.5 text-sm text-[#003366] outline-none transition focus:border-[#FF6B35]";

function Field({ label, children }) {
  return <label className="block text-sm font-medium text-[#003366]">{label}<span className="mt-1.5 block">{children}</span></label>;
}

function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export default function GroupTicketForm({ initial, categories, airlines, saving, error, onSubmit, onClose }) {
  const existingAirlineId = initial?.airlineId?._id || initial?.airlineId || airlines.find((airline) => airline.name === initial?.airline)?._id || "";
  const [form, setForm] = useState({
    category: initial?.category?._id || initial?.category || categories[0]?._id || "",
    airlineId: existingAirlineId,
    airline: initial?.airlineId?.name || initial?.airline || "",
    airlineLogo: initial?.airlineId?.logo || initial?.airlineLogo || "",
    groupName: initial?.groupName || "",
    departureDate: toDateInput(initial?.departureDate),
    segments: initial?.segments?.length ? initial.segments.map((segment) => ({ ...segment })) : [{ ...emptySegment }],
    baggage: initial?.baggage || "",
    mealAvailable: initial?.mealAvailable ?? false,
    adultFare: initial?.adultFare ?? "",
    childFare: initial?.childFare ?? "",
    infantFare: initial?.infantFare ?? "",
    infantPriceOnCall: initial?.infantPriceOnCall ?? false,
    currency: initial?.currency || "SAR",
  });

  const setValue = (event) => {
    const { name, value, type, checked } = event.target;
    if (name === "airlineId") {
      const selectedAirline = airlines.find((airline) => airline._id === value);
      setForm((current) => ({
        ...current,
        airlineId: value,
        airline: selectedAirline?.name || "",
        airlineLogo: selectedAirline?.logo || "",
      }));
      return;
    }
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const setSegment = (index, event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      segments: current.segments.map((segment, position) => position === index ? { ...segment, [name]: value } : segment),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      adultFare: Number(form.adultFare),
      childFare: Number(form.childFare || 0),
      infantFare: Number(form.infantFare || 0),
      currency: form.currency.trim().toUpperCase(),
      segments: form.segments.map((segment) => ({
        ...segment,
        from: segment.from.trim(),
        to: segment.to.trim(),
        flightNumber: segment.flightNumber.trim(),
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#003366]/60 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="my-8 w-full max-w-4xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#003366]">{initial ? "Edit group ticket" : "Add group ticket"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-xl text-[#003366] hover:bg-[#EDEEE9]"><FiX /></button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <select name="category" value={form.category} onChange={setValue} required className={`dropdown-select ${inputClass}`}>
              <option value="">Select category</option>
              {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
            </select>
          </Field>
          <Field label="Airline">
            <select name="airlineId" value={form.airlineId} onChange={setValue} required className={`dropdown-select ${inputClass}`}>
              <option value="">Select airline</option>
              {airlines.map((airline) => <option key={airline._id} value={airline._id}>{airline.name}</option>)}
            </select>
          </Field>
          <Field label="Group / route name"><input name="groupName" value={form.groupName} onChange={setValue} required className={inputClass} placeholder="Dammam to Peshawar" /></Field>
          <Field label="Departure date"><input name="departureDate" type="date" value={form.departureDate} onChange={setValue} required className={inputClass} /></Field>

          {form.airlineLogo && (
            <div className="flex items-center gap-3 sm:col-span-2">
              <img src={form.airlineLogo} alt={`${form.airline} logo preview`} className="size-14 rounded-xl border border-[#003366]/10 object-contain p-1" />
              <p className="text-sm text-[#003366]/70">Logo from the selected airline.</p>
            </div>
          )}

          <div className="sm:col-span-2">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#003366]">Flight segments</h3>
              <button type="button" onClick={() => setForm((current) => ({ ...current, segments: [...current.segments, { ...emptySegment }] }))} className="inline-flex items-center gap-2 rounded-lg bg-[#EDEEE9] px-3 py-2 text-sm font-medium text-[#003366] hover:bg-[#003366] hover:text-white"><FiPlus /> Add segment</button>
            </div>
            <div className="space-y-3">
              {form.segments.map((segment, index) => (
                <div key={index} className="grid gap-3 rounded-xl border border-[#003366]/10 p-3 sm:grid-cols-2 lg:grid-cols-5">
                  <Field label="From"><input name="from" value={segment.from} onChange={(event) => setSegment(index, event)} required className={inputClass} placeholder="Dammam" /></Field>
                  <Field label="To"><input name="to" value={segment.to} onChange={(event) => setSegment(index, event)} required className={inputClass} placeholder="Peshawar" /></Field>
                  <Field label="Flight no."><input name="flightNumber" value={segment.flightNumber} onChange={(event) => setSegment(index, event)} required className={inputClass} placeholder="SV-736" /></Field>
                  <Field label="Departure time"><input name="departureTime" type="time" value={segment.departureTime} onChange={(event) => setSegment(index, event)} className={inputClass} /></Field>
                  <div className="flex items-end gap-2">
                    <Field label="Arrival time"><input name="arrivalTime" type="time" value={segment.arrivalTime} onChange={(event) => setSegment(index, event)} className={inputClass} /></Field>
                    {form.segments.length > 1 && <button type="button" aria-label={`Remove segment ${index + 1}`} onClick={() => setForm((current) => ({ ...current, segments: current.segments.filter((_, position) => position !== index) }))} className="mb-0.5 rounded-lg bg-red-50 p-2.5 text-red-600 hover:bg-red-600 hover:text-white"><FiX /></button>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Field label="Baggage"><input name="baggage" value={form.baggage} onChange={setValue} required className={inputClass} placeholder="23+23+7 KG" /></Field>
          <Field label="Currency"><input name="currency" value={form.currency} onChange={setValue} required maxLength={3} className={inputClass} placeholder="SAR" /></Field>
          <Field label="Adult fare"><input name="adultFare" type="number" min="0" step="0.01" value={form.adultFare} onChange={setValue} required className={inputClass} /></Field>
          <Field label="Child fare"><input name="childFare" type="number" min="0" step="0.01" value={form.childFare} onChange={setValue} className={inputClass} /></Field>
          <Field label="Price"><input name="infantFare" type="number" min="0" step="0.01" value={form.infantFare} onChange={setValue} disabled={form.infantPriceOnCall} className={inputClass} /></Field>
          <div className="flex flex-wrap gap-x-6 gap-y-3 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-[#003366]"><input type="checkbox" name="mealAvailable" checked={form.mealAvailable} onChange={setValue} className="size-4 accent-[#FF6B35]" />Meal included</label>
            <label className="flex items-center gap-2 text-sm text-[#003366]"><input type="checkbox" name="infantPriceOnCall" checked={form.infantPriceOnCall} onChange={setValue} className="size-4 accent-[#FF6B35]" />Infant price on call</label>
          </div>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#003366] hover:bg-[#EDEEE9]">Cancel</button>
          <button type="submit" disabled={saving || categories.length === 0 || airlines.length === 0} className="rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : initial ? "Update ticket" : "Create ticket"}</button>
        </div>
      </form>
    </div>
  );
}
