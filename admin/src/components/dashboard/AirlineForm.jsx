"use client";

import { useState } from "react";
import { FiX, FiUploadCloud } from "react-icons/fi";
import { useApp } from "@/context/AppContext";

const emptyForm = {
    name: "",
    network: "",
    logo: "",
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

export default function AirlineForm({ initial, saving, error, onSubmit, onClose }) {
    const { uploadImage } = useApp();
    const [form, setForm] = useState(initial ? { ...emptyForm, ...initial } : emptyForm);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    const setValue = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadError("");

        const { ok, data } = await uploadImage(file);

        setUploading(false);
        e.target.value = "";

        if (!ok) {
            setUploadError(data.message || "Logo upload nahi ho saka");
            return;
        }
        setForm((prev) => ({ ...prev, logo: data.url }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.logo) {
            setUploadError("Pehle logo upload karo");
            return;
        }
        onSubmit({
            name: form.name.trim(),
            network: form.network.trim(),
            logo: form.logo,
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
                        {initial ? "Airline edit karo" : "Nayi airline"}
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
                    <Field label="Airline name">
                        <input name="name" value={form.name} onChange={setValue} required className={inputClass} placeholder="Pakistan International" />
                    </Field>

                    <Field label="Network / routes">
                        <input name="network" value={form.network} onChange={setValue} required className={inputClass} placeholder="Islamabad · Lahore · Karachi" />
                    </Field>

                    <div>
                        <span className="mb-1.5 block text-sm font-medium text-[#003366]">Logo</span>

                        <div className="flex items-center gap-4">
                            {form.logo && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={form.logo}
                                    alt="Logo preview"
                                    className="h-24 w-24 shrink-0 rounded-xl border border-[#003366]/10 bg-white object-contain p-2"
                                />
                            )}

                            <label className="flex min-h-24 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#003366]/20 px-4 py-4 text-center text-sm text-[#003366]/70 transition hover:border-[#FF6B35] hover:text-[#FF6B35]">
                                <FiUploadCloud className="shrink-0 text-lg" />
                                {uploading ? "Uploading..." : form.logo ? "Logo badlo" : "Logo select karo (max 4MB)"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
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