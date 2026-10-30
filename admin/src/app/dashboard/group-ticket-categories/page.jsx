"use client";

import { useCallback, useEffect, useState } from "react";
import { FiEdit2, FiLayers, FiPlus, FiTrash2 } from "react-icons/fi";
import EmptyState from "@/components/dashboard/EmptyState";
import GroupTicketCategoryForm from "@/components/dashboard/GroupTicketCategoryForm";
import PageHeader from "@/components/dashboard/PageHeader";
import { useApp } from "@/context/AppContext";

const getCategoryImageUrl = (url) =>
  url?.includes("/upload/")
    ? url.replace("/upload/", "/upload/f_auto,q_auto,w_128,h_128,c_fill/")
    : url;

export default function GroupTicketCategoriesPage() {
  const { getGroupTicketCategories, createGroupTicketCategory, updateGroupTicketCategory, deleteGroupTicketCategory } = useApp();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadCategories = useCallback(async () => {
    const { ok, data } = await getGroupTicketCategories();
    if (ok) {
      setCategories(data.data);
      setListError("");
    } else setListError(data.message || "Unable to load categories.");
    setLoading(false);
  }, [getGroupTicketCategories]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadCategories(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadCategories]);

  const openForm = (category = null) => {
    setEditing(category);
    setFormError("");
    setFormOpen(true);
  };

  const handleSubmit = async (body) => {
    setSaving(true);
    const { ok, data } = editing
      ? await updateGroupTicketCategory(editing._id, body)
      : await createGroupTicketCategory(body);
    setSaving(false);
    if (!ok) {
      setFormError(data.message || "Unable to save the category.");
      return;
    }
    setFormOpen(false);
    await loadCategories();
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete the "${category.name}" category?`)) return;
    const { ok, data } = await deleteGroupTicketCategory(category._id);
    if (!ok) {
      window.alert(data.message || "Unable to delete the category.");
      return;
    }
    await loadCategories();
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5">
        <PageHeader title="Group Ticket Categories" description="Categories appear in the Group Tickets menu and customer dashboard." className="mb-0" />
        <button onClick={() => openForm()} className="flex items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"><FiPlus /> Add category</button>
      </div>

      {loading ? <p className="text-sm text-[#003366]/60">Loading...</p>
        : listError ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{listError}</p>
          : categories.length === 0 ? <EmptyState icon={FiLayers} title="No categories yet" text="Select Add category to create your first group ticket category." />
            : <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="divide-y divide-[#003366]/10">
                {categories.map((category) => (
                  <div key={category._id} className="flex flex-wrap items-center gap-4 p-4">
                    {(category.image || category.logo) ? <img src={getCategoryImageUrl(category.image || category.logo)} alt="" className="size-12 rounded-xl border border-[#003366]/10 object-cover" /> : <span className="flex size-12 items-center justify-center rounded-xl bg-[#FF6B35]/10 text-[#FF6B35]"><FiLayers /></span>}
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-[#003366]">{category.name}</h2>
                      <p className="text-xs text-[#003366]/60">/{category.slug}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => openForm(category)} aria-label={`Edit ${category.name}`} className="rounded-lg bg-[#EDEEE9] p-2.5 text-[#003366] hover:bg-[#003366] hover:text-white"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(category)} aria-label={`Delete ${category.name}`} className="rounded-lg bg-red-50 p-2.5 text-red-600 hover:bg-red-600 hover:text-white"><FiTrash2 /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>}

      {formOpen && <GroupTicketCategoryForm key={editing?._id || "new"} initial={editing} saving={saving} error={formError} onSubmit={handleSubmit} onClose={() => setFormOpen(false)} />}
    </div>
  );
}
