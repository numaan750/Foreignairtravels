"use client";

import { useCallback, useEffect, useState } from "react";
import { FiSend, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import AirlineForm from "@/components/dashboard/AirlineForm";
import { useApp } from "@/context/AppContext";

export default function AirlinesPage() {
    const { getAirlines, createAirline, updateAirline, deleteAirline } = useApp();

    const [airlines, setAirlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState("");

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const loadAirlines = useCallback(async () => {
        const { ok, data } = await getAirlines();
        if (ok) {
            setAirlines(data.data);
            setListError("");
        } else {
            setListError(data.message || "Unable to load airlines.");
        }
        setLoading(false);
    }, [getAirlines]);

    useEffect(() => {
        loadAirlines();
    }, [loadAirlines]);

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
            ? await updateAirline(editing._id, body)
            : await createAirline(body);

        setSaving(false);

        if (!ok) {
            setFormError(data.message || "Unable to save the airline.");
            return;
        }

        closeForm();
        loadAirlines();
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;

        const { ok, data } = await deleteAirline(item._id);
        if (!ok) {
            alert(data.message || "Unable to delete the airline.");
            return;
        }
        loadAirlines();
    };

    return (
        <div>
            <div className="flex flex-wrap items-start justify-between gap-4 pb-5">
                <PageHeader title="Airlines" description="Manage partner airlines." className="mb-0" />
                <button
                    onClick={openCreate}
                    className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                    <FiPlus /> Add airline
                </button>
            </div>

            {loading ? (
                <p className="text-sm text-[#003366]/60">Loading...</p>
            ) : listError ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{listError}</p>
            ) : airlines.length === 0 ? (
                <EmptyState icon={FiSend} title="No airlines yet" text="Select Add airline above to create your first airline." />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {airlines.map((item) => (
                        <div key={item._id} className="rounded-2xl bg-white p-4 shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.logo} alt={item.name} className="h-14 w-28 object-contain object-left" />

                            <h3 className="mt-4 truncate text-base font-semibold text-[#003366]">{item.name}</h3>
                            <p className="mt-1 line-clamp-2 text-sm text-[#003366]/70">{item.network}</p>

                            <div className="mt-4 flex gap-3">
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
                    ))}
                </div>
            )}

            {formOpen && (
                <AirlineForm
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