"use client";

import { useEffect, useState } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { useApp } from "@/context/AppContext";

const inputClass =
  "w-full rounded-xl border border-[#003366]/15 bg-white px-4 py-2.5 text-sm text-[#003366] outline-none transition focus:border-[#FF6B35]";

const prepareCategoryImage = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();
    const cleanup = () => URL.revokeObjectURL(objectUrl);

    image.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        cleanup();
        reject(new Error("Could not prepare this image. Please try another file."));
        return;
      }

      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          cleanup();
          if (!blob) {
            reject(new Error("Could not compress this image. Please try another file."));
            return;
          }
          resolve(new File([blob], "category-image.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.82
      );
    };

    image.onerror = () => {
      cleanup();
      reject(new Error("Could not read this image. Please choose another file."));
    };
    image.src = objectUrl;
  });

const getCategoryImageUrl = (url, width) =>
  url?.includes("/upload/")
    ? url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`)
    : url;

export default function GroupTicketCategoryForm({ initial, saving, error, onSubmit, onClose }) {
  const { uploadImage } = useApp();
  const [form, setForm] = useState({
    name: initial?.name || "",
    image: initial?.image || initial?.logo || "",
    logo: initial?.logo || initial?.image || "",
    tagline: initial?.tagline || "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageChange = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    setUploadError("");
    try {
      const optimizedImage = await prepareCategoryImage(file);
      const { ok, data } = await uploadImage(optimizedImage);
      if (!ok) throw new Error(data.message || "Image upload failed.");
      setForm((current) => ({ ...current, image: data.url, logo: data.url }));
      setPreviewUrl("");
    } catch (error) {
      setPreviewUrl("");
      setUploadError(error.message || "Image upload failed.");
    } finally {
      setUploading(false);
      input.value = "";
    }
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
          <span className="mb-1.5 block text-sm font-medium text-[#003366]">Optional category image</span>
          <div className="flex items-center gap-4">
            {(previewUrl || form.image) && <img src={previewUrl || getCategoryImageUrl(form.image, 256)} alt="Category image preview" className="size-20 rounded-xl border border-[#003366]/10 object-cover" />}
            <label className="flex min-h-16 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#003366]/20 px-4 py-3 text-center text-sm text-[#003366]/70 hover:border-[#FF6B35] hover:text-[#FF6B35]">
              <FiUploadCloud />
              {uploading ? "Uploading..." : form.image ? "Change image" : "Choose image"}
              <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} className="hidden" />
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
