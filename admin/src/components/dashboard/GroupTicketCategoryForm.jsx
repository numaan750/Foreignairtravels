"use client";

import { useState } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { useApp } from "@/context/AppContext";

const inputClass =
  "w-full rounded-xl border border-[#003366]/15 bg-white px-4 py-2.5 text-sm text-[#003366] outline-none transition focus:border-[#FF6B35]";

export default function GroupTicketCategoryForm({ initial, saving, error, onSubmit, onClose }) {
  const { uploadImage } = useApp();
  const [form, setForm] = useState({
    name: initial?.name || "",
    logo: initial?.logo || "",
    tagline: initial?.tagline || "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleLogoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    const { ok, data } = await uploadImage(file);
    setUploading(false);
    event.target.value = "";
    if (!ok) {
      setUploadError(data.message || "Logo upload failed.");
      return;
    }
    setForm((current) => ({ ...current, logo: data.url }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ ...form, name: form.name.trim(), tagline: form.tagline.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#003366]/60 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="my-8 w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#003366]">{initial ? "Edit category" : "New group ticket category"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-xl text-[#003366] hover:bg-[#EDEEE9]"><FiX /></button>
        </div>

        <label className="mb-4 block text-sm font-medium text-[#003366]">
          Category name
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required className={`${inputClass} mt-1.5`} placeholder="KSA to Pakistan" />
        </label>
        <label className="mb-4 block text-sm font-medium text-[#003366]">
          Optional tagline
          <input value={form.tagline} onChange={(event) => setForm((current) => ({ ...current, tagline: event.target.value }))} className={`${inputClass} mt-1.5`} placeholder="Add a short tagline" />
        </label>
        <div className="mb-4">
          <span className="mb-1.5 block text-sm font-medium text-[#003366]">Optional category logo</span>
          <div className="flex items-center gap-4">
            {form.logo && <img src={form.logo} alt="Category logo preview" className="size-16 rounded-xl border border-[#003366]/10 object-contain p-2" />}
            <label className="flex min-h-16 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#003366]/20 px-4 py-3 text-center text-sm text-[#003366]/70 hover:border-[#FF6B35] hover:text-[#FF6B35]">
              <FiUploadCloud />
              {uploading ? "Uploading..." : form.logo ? "Change logo" : "Choose logo (max 4MB)"}
              <input type="file" accept="image/*" onChange={handleLogoChange} disabled={uploading} className="hidden" />
            </label>
          </div>
          {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#003366] hover:bg-[#EDEEE9]">Cancel</button>
          <button type="submit" disabled={saving || uploading} className="rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">{saving ? "Saving..." : initial ? "Update" : "Create"}</button>
        </div>
      </form>
    </div>
  );
}
