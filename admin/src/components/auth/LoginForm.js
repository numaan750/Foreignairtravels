"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    FiAlertCircle,
    FiEye,
    FiEyeOff,
    FiLoader,
    FiLock,
    FiMail,
} from "react-icons/fi";
import { FaPlaneDeparture } from "react-icons/fa";
import { useApp } from "@/context/AppContext";
import Loader from "@/components/common/Loader";

const inputClass =
    "w-full rounded-xl border border-white/25 bg-white/10 py-3 pl-11 text-sm text-white outline-none transition placeholder:text-white/50 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/40";

export default function LoginForm() {
    const router = useRouter();
    const { admin, authLoading, login } = useApp();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Login ho chuka ho (ya abhi login hua ho) to dashboard par bhejo
    useEffect(() => {
        if (!authLoading && admin) router.replace("/dashboard");
    }, [authLoading, admin, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        setError("");
        setSubmitting(true);

        const result = await login(email, password);
        if (!result.ok) {
            setError(result.message);
            setSubmitting(false);
        }
    };

    if (authLoading || admin) return <Loader />;

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#003366]">
            {/* Background image */}
            <Image
                src="/admin-login-background-imag.jpg"
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
            />

            {/* Dark overlay + soft colour glows */}
            <div className="absolute inset-0 bg-[#003366]/70" />
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#FF6B35]/30 blur-3xl sm:h-96 sm:w-96" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#EDEEE9]/20 blur-3xl sm:h-96 sm:w-96" />

            {/* Content */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
                <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6B35] text-2xl text-white shadow-lg shadow-[#FF6B35]/30 sm:h-16 sm:w-16">
                            <FaPlaneDeparture />
                        </div>
                        <h1 className="text-2xl font-bold text-white sm:text-3xl">
                            Admin Login
                        </h1>
                        <p className="mt-2 text-sm text-[#EDEEE9]/80">
                            ForeignAirTravel admin panel sign in
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error */}
                        {error && (
                            <div
                                role="alert"
                                className="flex items-start gap-2 rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-3 text-sm text-red-100"
                            >
                                <FiAlertCircle className="mt-0.5 shrink-0 text-base" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-sm font-medium text-[#EDEEE9]"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#FF6B35]" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    className={`${inputClass} pr-4`}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-sm font-medium text-[#EDEEE9]"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#FF6B35]" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={`${inputClass} pr-12`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-lg text-[#FF6B35] transition hover:text-[#e85a26]"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B35] py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF6B35]/30 transition hover:bg-[#e85a26] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/60 focus:ring-offset-2 focus:ring-offset-[#003366] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {submitting ? (
                                <>
                                    <FiLoader className="animate-spin text-lg" />
                                    Signing in...
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs text-[#EDEEE9]/60">
                        @2024 ForeignAirTravel. All rights reserved.
                    </p>
                </div>
            </div>
        </main>
    );
}