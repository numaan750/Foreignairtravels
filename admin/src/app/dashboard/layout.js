"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Loader from "@/components/common/Loader";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { admin, authLoading } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !admin) router.replace("/login");
  }, [authLoading, admin, router]);

  if (authLoading || !admin) return <Loader />;

  return (
    <div className="min-h-screen bg-[#EDEEE9] text-[#003366]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-w-0 lg:pl-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}