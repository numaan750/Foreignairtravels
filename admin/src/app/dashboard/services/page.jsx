"use client";

import { useCallback, useEffect, useState } from "react";
import { FiLayers, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import ServiceForm from "@/components/dashboard/ServiceForm";
import { useApp } from "@/context/AppContext";

export default function ServicesPage() {
  const { getServices, createService, updateService, deleteService } = useApp();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadServices = useCallback(async () => {
    const { ok, data } = await getServices();
    if (ok) {
      setServices(data.data);
      setListError("");
    } else {
      setListError(data.message || "Services load nahi ho saki");
    }
    setLoading(false);
  }, [getServices]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const openCreate = () => {
    setEditing(null);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const handleSubmit = async (body) => {
    setSaving(true);
    setFormError("");

    const { ok, data } = editing
      ? await updateService(editing._id, body)
      : await createService(body);

    setSaving(false);

    if (!ok) {
      setFormError(data.message || "Save nahi ho saka");
      return;
    }

    closeForm();
    loadServices();
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`"${item.title}" delete karna hai?`)) return;

    const { ok, data } = await deleteService(item._id);
    if (!ok) {
      alert(data.message || "Delete nahi ho saka");
      return;
    }
    loadServices();
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="Services" description="Website ki services yahan manage hongi." />
        <button
          onClick={openCreate}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <FiPlus /> Add service
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#003366]/60">Loading...</p>
      ) : listError ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{listError}</p>
      ) : services.length === 0 ? (
        <EmptyState icon={FiLayers} title="Abhi koi service nahi" text="Upar Add service se pehli service banao." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((item) => (
            <div key={item._id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.title} className="h-44 w-full object-cover" />

              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#FF6B35]">{item.tagline}</p>
                <h3 className="mt-1 truncate text-lg font-semibold text-[#003366]">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-[#003366]/70">{item.description}</p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#EDEEE9] py-2 text-sm font-medium text-[#003366] transition hover:bg-[#003366] hover:text-white"
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
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
        <ServiceForm
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