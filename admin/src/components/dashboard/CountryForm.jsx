"use client";

import { useState } from "react";
import { FiX, FiUploadCloud } from "react-icons/fi";
import { useApp } from "@/context/AppContext";

const emptyForm = {
    name: "",
    cities: "",
    note: "",
    flag: "",
    bgImage: "",
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

function ImageField({ label, value, uploading, onChange, previewClass }) {
    return (
        <div>
            <span className="mb-1.5 block text-sm font-medium text-[#003366]">{label}</span>
            <div className="flex items-center gap-4">
                {value && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={value}
                        alt={`${label} preview`}
                        className={`shrink-0 rounded-xl border border-[#003366]/10 bg-[#EDEEE9] ${previewClass}`}
                    />
                )}

                <label className="flex min-h-20 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#003366]/20 px-4 py-4 text-center text-sm text-[#003366]/70 transition hover:border-[#FF6B35] hover:text-[#FF6B35]">
                    <FiUploadCloud className="shrink-0 text-lg" />
                    {uploading ? "Uploading..." : value ? "Image badlo" : "Image select karo (max 4MB)"}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onChange}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    );
}

export default function CountryForm({ initial, saving, error, onSubmit, onClose }) {
    const { uploadImage } = useApp();
    const [form, setForm] = useState(initial ? { ...emptyForm, ...initial } : emptyForm);
    const [uploadingField, setUploadingField] = useState("");
    const [uploadError, setUploadError] = useState("");

    const setValue = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // field = "flag" ya "bgImage"
    const handleUpload = (field) => async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingField(field);
        setUploadError("");

        const { ok, data } = await uploadImage(file);

        setUploadingField("");
        e.target.value = "";

        if (!ok) {
            setUploadError(data.message || "Image upload nahi ho saki");
            return;
        }
        setForm((prev) => ({ ...prev, [field]: data.url }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.flag || !form.bgImage) {
            setUploadError("Flag aur background image dono upload karo");
            return;
        }
        onSubmit({
            name: form.name.trim(),
            cities: form.cities.trim(),
            note: form.note.trim(),
            flag: form.flag,
            bgImage: form.bgImage,
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
                        {initial ? "Country edit karo" : "Naya country"}
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
                    <Field label="Country name">
                        <input name="name" value={form.name} onChange={setValue} required className={inputClass} placeholder="Saudi Arabia" />
                    </Field>

                    <Field label="Cities">
                        <input name="cities" value={form.cities} onChange={setValue} required className={inputClass} placeholder="Jeddah · Riyadh · Madinah" />
                    </Field>

                    <Field label="Note (neeche wali line)">
                        <input name="note" value={form.note} onChange={setValue} required className={inputClass} placeholder="Umrah, family and business travel" />
                    </Field>

                    <ImageField
                        label="Flag"
                        value={form.flag}
                        uploading={uploadingField === "flag"}
                        onChange={handleUpload("flag")}
                        previewClass="h-14 w-20 object-cover"
                    />

                    <ImageField
                        label="Background image"
                        value={form.bgImage}
                        uploading={uploadingField === "bgImage"}
                        onChange={handleUpload("bgImage")}
                        previewClass="h-20 w-32 object-cover"
                    />

                    {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
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
                        disabled={saving || Boolean(uploadingField)}
                        className="cursor-pointer rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Saving..." : initial ? "Update" : "Create"}
                    </button>
                </div>
            </form>
        </div>
    );
}