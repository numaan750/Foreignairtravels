"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaPlaneDeparture } from "react-icons/fa";
import { FiLogOut, FiX } from "react-icons/fi";
import { useApp } from "@/context/AppContext";
import { navItems, isActivePath } from "@/config/navItems";

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { logout } = useApp();

  // Mobile par Escape dabane se sidebar band ho jaye
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-[#003366]/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col bg-[#003366] text-white shadow-2xl transition-transform duration-200 lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF6B35] text-base text-white">
              <FaPlaneDeparture />
            </div>
            <span className="text-lg font-bold tracking-tight">ForeignAirTravel</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Menu band karo"
            className="cursor-pointer rounded-lg p-2 text-xl text-[#EDEEE9]/80 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <FiX />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(item.href, pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-[#FF6B35] text-white shadow-md shadow-black/20"
                    : "text-[#EDEEE9]/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="shrink-0 text-lg" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-white/10 p-4">
          <button
            onClick={logout}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#EDEEE9]/80 transition hover:bg-[#FF6B35] hover:text-white"
          >
            <FiLogOut className="shrink-0 text-lg" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}