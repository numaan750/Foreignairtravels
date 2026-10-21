"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";

const emptyForm = {
    text: "",
    type: "warning",
    isActive: true,
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

export default function AnnouncementForm({ initial, saving, error, onSubmit, onClose }) {
    const [form, setForm] = useState(initial ? { ...emptyForm, ...initial } : emptyForm);

    const setValue = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            text: form.text.trim(),
            type: form.type,
            isActive: form.isActive,
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
                        {initial ? "Edit Announcment bar " : "New announcement"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="close it"
                        className="cursor-pointer rounded-lg p-2 text-xl text-[#003366] transition hover:bg-[#EDEEE9]"
                    >
                        <FiX />
                    </button>
                </div>

                <div className="space-y-4">
                    <Field label="Announcement text">
                        <textarea
                            name="text"
                            value={form.text}
                            onChange={setValue}
                            required
                            rows={3}
                            className={inputClass}
                            placeholder="Enjoy discount fares on group bookings"
                        />
                    </Field>

                    <Field label="Icon type">
                        <select name="type" value={form.type} onChange={setValue} className={`dropdown-select ${inputClass}`}>
                            <option value="warning">Warning (triangle icon)</option>
                            <option value="info">Info (circle icon)</option>
                        </select>
                    </Field>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-[#003366]">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={form.isActive}
                            onChange={setValue}
                            className="h-4 w-4 accent-[#FF6B35]"
                        />
                        Show this announcement on website
                    </label>
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
                        disabled={saving}
                        className="cursor-pointer rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Saving..." : initial ? "Update" : "Create"}
                    </button>
                </div>
            </form>
        </div>
    );
}