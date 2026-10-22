import { FiMap, FiCalendar, FiUsers, FiDollarSign } from "react-icons/fi";
import PageHeader from "@/components/dashboard/PageHeader";

const stats = [
  { label: "Total Packages", value: 0, icon: FiMap },
  { label: "Bookings", value: 0, icon: FiCalendar },
  { label: "Customers", value: 0, icon: FiUsers },
  { label: "Revenue", value: "Rs 0", icon: FiDollarSign },
];

export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Welcome back, Admin" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-[#003366]/60">{s.label}</p>
                <p className="mt-2 truncate text-2xl font-bold text-[#003366] sm:text-3xl">
                  {s.value}
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FF6B35]/10 text-xl text-[#FF6B35]">
                <Icon />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#003366]">Recent Activity</h2>
        <p className="mt-2 text-sm text-[#003366]/60">No activity yet.</p>
      </div>
    </div>
  );
}