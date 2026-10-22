"use client";

import { useCallback, useEffect, useState } from "react";
import { FiImage, FiPlus, FiTrash2 } from "react-icons/fi";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { useApp } from "@/context/AppContext";

export default function PopupImagesPage() {
  const { getPopupImages, createPopupImage, deletePopupImage, uploadImage } = useApp();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadImages = useCallback(async () => {
    const { ok, data } = await getPopupImages();
    if (ok) {
      setImages(data.data);
      setError("");
    } else {
      setError(data.message || "Unable to load images.");
    }
    setLoading(false);
  }, [getPopupImages]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleAdd = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const upload = await uploadImage(file);
    e.target.value = "";

    if (!upload.ok) {
      setUploading(false);
      setError(upload.data.message || "Image upload failed.");
      return;
    }

    const saved = await createPopupImage({ image: upload.data.url });
    setUploading(false);

    if (!saved.ok) {
      setError(saved.data.message || "Unable to save the image.");
      return;
    }
    loadImages();
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    const { ok, data } = await deletePopupImage(item._id);
    if (!ok) {
      alert(data.message || "Unable to delete the image.");
      return;
    }
    loadImages();
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5">
        <PageHeader title="Popup Images" description="These images appear in a dashboard popup after login." className="mb-0" />

        <label
          className={`flex items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 ${
            uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          }`}
        >
          <FiPlus /> {uploading ? "Uploading..." : "Add image"}
          <input
            type="file"
            accept="image/*"
            onChange={handleAdd}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-[#003366]/60">Loading...</p>
      ) : images.length === 0 ? (
        <EmptyState icon={FiImage} title="No popup images yet" text="Select Add image above to upload your first image." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {images.map((item, index) => (
            <div key={item._id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={`Popup ${index + 1}`} className="h-56 w-full object-cover" />
              <div className="flex items-center justify-between p-3">
                <span className="text-sm font-medium text-[#003366]">Image {index + 1}</span>
                <button
                  onClick={() => handleDelete(item)}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}