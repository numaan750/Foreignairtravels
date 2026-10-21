"use client";

import { useCallback, useEffect, useState } from "react";
import { FiMap, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import PackageForm from "@/components/dashboard/PackageForm";
import { useApp } from "@/context/AppContext";

export default function PackagesPage() {
  const { getPackages, createPackage, updatePackage, deletePackage } = useApp();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadPackages = useCallback(async () => {
    const { ok, data } = await getPackages();
    if (ok) {
      setPackages(data.data);
      setListError("");
    } else {
      setListError(data.message || "Packages load nahi ho sake");
    }
    setLoading(false);
  }, [getPackages]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const openCreate = () => {
    setEditing(null);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (pkg) => {
    setEditing(pkg);
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const handleSubmit = async (body) => {
    setSaving(true);
    setFormError("");

    const { ok, data } = editing
      ? await updatePackage(editing._id, body)
      : await createPackage(body);

    setSaving(false);

    if (!ok) {
      setFormError(data.message || "Save nahi ho saka");
      return;
    }

    closeForm();
    loadPackages();
  };

  const handleDelete = async (pkg) => {
    if (!window.confirm(`"${pkg.title}" delete karna hai?`)) return;

    const { ok, data } = await deletePackage(pkg._id);
    if (!ok) {
      alert(data.message || "Delete nahi ho saka");
      return;
    }
    loadPackages();
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5">
        <PageHeader title="Packages" description="Travel packages yahan manage honge." className="mb-0" />
        <button
          onClick={openCreate}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <FiPlus /> Add package
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#003366]/60">Loading...</p>
      ) : listError ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{listError}</p>
      ) : packages.length === 0 ? (
        <EmptyState icon={FiMap} title="Abhi koi package nahi" text="Upar Add package se pehla package banao." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg._id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pkg.image} alt={pkg.title} className="h-44 w-full object-cover" />

              <div className="p-4">
                <div className="mb-2 flex flex-wrap gap-2">
                  {pkg.isFeatured && (
                    <span className="rounded-full bg-[#003366] px-3 py-1 text-xs font-medium text-white">Featured</span>
                  )}
                  {!pkg.isActive && (
                    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">Hidden</span>
                  )}
                </div>

                <p className="text-xs text-[#FF6B35]">{pkg.location}</p>
                <h3 className="mt-1 truncate text-lg font-semibold text-[#003366]">{pkg.title}</h3>
                <p className="mt-1 text-sm text-[#003366]/70">
                  {pkg.currency} {pkg.price.toLocaleString()} / person
                </p>
                <p className="mt-1 text-xs text-[#003366]/60">
                  {pkg.days} Days / {pkg.nights} Nights · {pkg.travelType}
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => openEdit(pkg)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#EDEEE9] py-2 text-sm font-medium text-[#003366] transition hover:bg-[#003366] hover:text-white"
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pkg)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-50 py-2 text-sm font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <PackageForm
          key={editing?._id || "new"}
          initial={editing}
          saving={saving}
          error={formError}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}
    </div>
  );
}