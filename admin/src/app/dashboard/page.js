"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowUpRight, FiCalendar, FiMap, FiUsers } from "react-icons/fi";
import PageHeader from "@/components/dashboard/PageHeader";
import { useApp } from "@/context/AppContext";

const dashboardCards = [
  { key: "packages", label: "Total Packages", href: "/dashboard/packages", icon: FiMap },
  { key: "bookings", label: "Bookings", href: "/dashboard/inquiries", icon: FiCalendar },
  { key: "customers", label: "Verified Customers", href: "/dashboard/customers", icon: FiUsers },
];

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function DashboardPage() {
  const { getPackages, getCustomers, getInquiries } = useApp();
  const [counts, setCounts] = useState({ packages: null, bookings: null, customers: null });
  const [recentBookings, setRecentBookings] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    const [packagesResult, customersResult, bookingsResult] = await Promise.all([
      getPackages(),
      getCustomers(),
      getInquiries(),
    ]);
    const nextErrors = [];

    if (packagesResult.ok) {
      setCounts((current) => ({ ...current, packages: packagesResult.data.data.length }));
    } else {
      nextErrors.push(packagesResult.data.message || "Unable to load package totals.");
    }

    if (customersResult.ok) {
      const verifiedCustomers = customersResult.data.data.filter((customer) => customer.isVerified);
      setCounts((current) => ({ ...current, customers: verifiedCustomers.length }));
    } else {
      nextErrors.push(customersResult.data.message || "Unable to load customer totals.");
    }

    if (bookingsResult.ok) {
      const bookings = bookingsResult.data.data;
      setCounts((current) => ({ ...current, bookings: bookings.length }));
      setRecentBookings(bookings.slice(0, 5));
    } else {
      nextErrors.push(bookingsResult.data.message || "Unable to load bookings.");
    }

    setErrors(nextErrors);
    setLoading(false);
  }, [getPackages, getCustomers, getInquiries]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadDashboard(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadDashboard]);

  return (
    <div>
      <PageHeader title="Dashboard" description="Welcome back, Admin" />

      <section aria-label="Dashboard totals" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardCards.map(({ key, label, href, icon: Icon }) => (
          <Link
            key={key}
            href={href}
            className="group flex min-w-0 items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-[#003366]/60">{label}</p>
              <p className="mt-2 truncate text-2xl font-bold text-[#003366] sm:text-3xl" aria-live="polite">
                {counts[key] ?? (loading ? "..." : "—")}
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FF6B35]/10 text-xl text-[#FF6B35]">
              <Icon aria-hidden="true" />
            </div>
          </Link>
        ))}
      </section>

      {errors.length > 0 && (
        <div role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.map((error) => <p key={error}>{error}</p>)}
        </div>
      )}

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#003366]">Latest Booking Requests</h2>
          <Link
            href="/dashboard/inquiries"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#FF6B35] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35]"
          >
            View all <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>

        {loading && recentBookings === null ? (
          <p role="status" className="text-sm text-[#003366]/60">Loading booking requests...</p>
        ) : recentBookings === null ? (
          <p className="text-sm text-[#003366]/60">Booking requests are unavailable.</p>
        ) : recentBookings.length === 0 ? (
          <p className="text-sm text-[#003366]/60">No booking requests yet.</p>
        ) : (
          <ul className="divide-y divide-[#003366]/10">
            {recentBookings.map((booking) => (
              <li key={booking._id}>
                <Link
                  href="/dashboard/inquiries"
                  className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-[#003366]">
                      {booking.ticketDetails?.groupName || "Group ticket booking"}
                    </span>
                    <span className="mt-1 block truncate text-xs text-[#003366]/60">
                      {booking.user?.name || "Customer"} · {formatDate(booking.createdAt)}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-[#FF6B35]/10 px-3 py-1 text-xs font-medium capitalize text-[#003366]">
                    {booking.status?.replaceAll("_", " ") || "Pending"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
