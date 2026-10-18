"use client";

import { useCallback, useEffect, useState } from "react";
import { FiGlobe, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import CountryForm from "@/components/dashboard/CountryForm";
import { useApp } from "@/context/AppContext";

export default function CountriesPage() {
    const { getCountries, createCountry, updateCountry, deleteCountry } = useApp();

    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState("");

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const loadCountries = useCallback(async () => {
        const { ok, data } = await getCountries();
        if (ok) {
            setCountries(data.data);
            setListError("");
        } else {
            setListError(data.message || "Countries load nahi ho saki");
        }
        setLoading(false);
    }, [getCountries]);

    useEffect(() => {
        loadCountries();
    }, [loadCountries]);

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
            ? await updateCountry(editing._id, body)
            : await createCountry(body);

        setSaving(false);

        if (!ok) {
            setFormError(data.message || "Save nahi ho saka");
            return;
        }

        closeForm();
        loadCountries();
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`"${item.name}" delete karna hai?`)) return;

        const { ok, data } = await deleteCountry(item._id);
        if (!ok) {
            alert(data.message || "Delete nahi ho saka");
            return;
        }
        loadCountries();
    };

    return (
        <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <PageHeader title="Countries" description="Website ke countries yahan manage honge." />
                <button
                    onClick={openCreate}
                    className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                    <FiPlus /> Add country
                </button>
            </div>

            {loading ? (
                <p className="text-sm text-[#003366]/60">Loading...</p>
            ) : listError ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{listError}</p>
            ) : countries.length === 0 ? (
                <EmptyState icon={FiGlobe} title="Abhi koi country nahi" text="Upar Add country se pehla country banao." />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {countries.map((item) => (
                        <div key={item._id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                            <div className="relative h-32 w-full">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.bgImage} alt={item.name} className="h-full w-full object-cover" />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.flag}
                                    alt={`${item.name} flag`}
                                    className="absolute left-3 top-3 h-8 w-12 rounded border border-white/40 object-cover"
                                />
                            </div>

                            <div className="p-4">
                                <h3 className="truncate text-lg font-semibold text-[#003366]">{item.name}</h3>
                                <p className="mt-1 line-clamp-1 text-sm text-[#003366]/70">{item.cities}</p>
                                <p className="mt-1 line-clamp-1 text-xs text-[#003366]/60">{item.note}</p>

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
                <CountryForm
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