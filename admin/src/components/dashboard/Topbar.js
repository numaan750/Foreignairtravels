"use client";

import { usePathname } from "next/navigation";
import { FiMenu } from "react-icons/fi";
import { useApp } from "@/context/AppContext";
import { navItems, isActivePath } from "@/config/navItems";

export default function Topbar({ onMenuClick }) {
  const pathname = usePathname();
  const { admin } = useApp();

  const current = navItems.find((item) => isActivePath(item.href, pathname));

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#003366]/10 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Menu kholo"
        className="cursor-pointer rounded-lg p-2 text-2xl text-[#003366] transition hover:bg-[#EDEEE9] lg:hidden"
      >
        <FiMenu />
      </button>

      <span className="min-w-0 truncate text-base font-semibold text-[#003366] sm:text-lg">
        {current?.label || "Dashboard"}
      </span>

      <div className="ml-auto flex min-w-0 items-center gap-3">
        <span className="hidden max-w-[220px] truncate text-sm text-[#003366]/70 md:block">
          {admin?.email}
        </span>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF6B35] text-sm font-semibold uppercase text-white">
          {admin?.email?.[0] || "A"}
        </div>
      </div>
    </header>
  );
}