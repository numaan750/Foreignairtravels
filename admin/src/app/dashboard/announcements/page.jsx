"use client";

import { useCallback, useEffect, useState } from "react";
import { FiBell, FiPlus, FiEdit2, FiTrash2, FiAlertTriangle, FiInfo } from "react-icons/fi";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import AnnouncementForm from "@/components/dashboard/AnnouncementForm";
import { useApp } from "@/context/AppContext";

export default function AnnouncementsPage() {
    const { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useApp();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState("");

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const loadItems = useCallback(async () => {
        const { ok, data } = await getAnnouncements();
        if (ok) {
            setItems(data.data);
            setListError("");
        } else {
            setListError(data.message || "Unable to load announcements.");
        }
        setLoading(false);
    }, [getAnnouncements]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

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
            ? await updateAnnouncement(editing._id, body)
            : await createAnnouncement(body);

        setSaving(false);

        if (!ok) {
            setFormError(data.message || "Unable to save the announcement.");
            return;
        }

        closeForm();
        loadItems();
    };

    const handleDelete = async (item) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;

        const { ok, data } = await deleteAnnouncement(item._id);
        if (!ok) {
            alert(data.message || "Unable to delete the announcement.");
            return;
        }
        loadItems();
    };

    return (
        <div>
            <div className="flex flex-wrap items-start justify-between gap-4 pb-5">
                <PageHeader title="Announcements" description="Manage the announcement bar displayed on the website." className="mb-0" />
                <button
                    onClick={openCreate}
                    className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                    <FiPlus /> Add announcement
                </button>
            </div>

            {loading ? (
                <p className="text-sm text-[#003366]/60">Loading...</p>
            ) : listError ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{listError}</p>
            ) : items.length === 0 ? (
                <EmptyState icon={FiBell} title="No announcements yet" text="Select Add announcement above to create your first announcement." />
            ) : (
                <div className="space-y-3">
                    {items.map((item) => {
                        const Icon = item.type === "info" ? FiInfo : FiAlertTriangle;
                        return (
                            <div
                                key={item._id}
                                className="grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex"
                            >
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6B35]/10 text-lg text-[#FF6B35]">
                                    <Icon />
                                </span>

                                <div className="min-w-0 sm:flex-1">
                                    <p className="break-words text-sm font-medium leading-5 text-[#003366]">{item.text}</p>
                                    {!item.isActive && (
                                        <span className="mt-1 inline-block rounded-full bg-gray-200 px-3 py-0.5 text-xs font-medium text-gray-600">
                                            Hidden
                                        </span>
                                    )}
                                </div>

                                <div className="col-span-2 flex justify-end gap-3 sm:col-span-1 sm:shrink-0">
                                    <button
                                        onClick={() => openEdit(item)}
                                        className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#EDEEE9] px-4 py-2 text-sm font-medium text-[#003366] transition hover:bg-[#003366] hover:text-white"
                                    >
                                        <FiEdit2 /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item)}
                                        className="flex cursor-pointer items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
                                    >
                                        <FiTrash2 /> Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {formOpen && (
                <AnnouncementForm
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