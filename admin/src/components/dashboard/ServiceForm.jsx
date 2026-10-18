"use client";

import { useState } from "react";
import { FiX, FiUploadCloud } from "react-icons/fi";
import { useApp } from "@/context/AppContext";

const emptyForm = {
  title: "",
  tagline: "",
  description: "",
  image: "",
};

const inputClass =
  "w-full rounded-xl border border-[#003366]/15 bg-white px-4 py-2.5 text-sm text-[#003366] outline-none transition focus:border-[#FF6B35]";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#003366]">{label}</span>
      {children}
    </label>
  );
}

export default function ServiceForm({ initial, saving, error, onSubmit, onClose }) {
  const { uploadImage } = useApp();
  const [form, setForm] = useState(initial ? { ...emptyForm, ...initial } : emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const setValue = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const { ok, data } = await uploadImage(file);

    setUploading(false);
    e.target.value = "";

    if (!ok) {
      setUploadError(data.message || "Image upload nahi ho saki");
      return;
    }
    setForm((prev) => ({ ...prev, image: data.url }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.image) {
      setUploadError("Pehle image upload karo");
      return;
    }
    onSubmit({
      title: form.title.trim(),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      image: form.image,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#003366]/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="my-8 w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#003366]">
            {initial ? "Service edit karo" : "Nayi service"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Band karo"
            className="cursor-pointer rounded-lg p-2 text-xl text-[#003366] transition hover:bg-[#EDEEE9]"
          >
            <FiX />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Heading">
            <input name="title" value={form.title} onChange={setValue} required className={inputClass} placeholder="Flight reservations" />
          </Field>

          <Field label="Tagline">
            <input name="tagline" value={form.tagline} onChange={setValue} required className={inputClass} placeholder="Worldwide routes" />
          </Field>

          <Field label="Description">
            <textarea name="description" value={form.description} onChange={setValue} required rows={3} className={inputClass} />
          </Field>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-[#003366]">Image</span>

            <div className="flex items-center gap-4">
              {form.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.image}
                  alt="Preview"
                  className="h-24 w-24 shrink-0 rounded-xl border border-[#003366]/10 object-cover"
                />
              )}

              <label className="flex min-h-24 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#003366]/20 px-4 py-4 text-center text-sm text-[#003366]/70 transition hover:border-[#FF6B35] hover:text-[#FF6B35]">
                <FiUploadCloud className="shrink-0 text-lg" />
                {uploading ? "Uploading..." : form.image ? "Image badlo" : "Image select karo (max 4MB)"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-medium text-[#003366] transition hover:bg-[#EDEEE9]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="cursor-pointer rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : initial ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}