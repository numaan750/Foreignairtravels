"use client";

import { useCallback, useEffect, useState } from "react";
import { FiMail, FiMapPin, FiPhone, FiUsers } from "react-icons/fi";
import EmptyState from "@/components/dashboard/EmptyState";
import PageHeader from "@/components/dashboard/PageHeader";
import { useApp } from "@/context/AppContext";

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function CustomersPage() {
  const { getCustomers } = useApp();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomers = useCallback(async () => {
    const { ok, data } = await getCustomers();
    if (ok) {
      setCustomers(data.data);
      setError("");
    } else {
      setError(data.message || "Customers load nahi ho sake.");
    }
    setLoading(false);
  }, [getCustomers]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadCustomers(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadCustomers]);

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Website par registered users."
      />

      {loading ? (
        <div role="status" className="rounded-2xl bg-white p-6 text-sm text-[#003366]/60 shadow-sm">
          Customers load ho rahe hain...
        </div>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={FiUsers}
          title="Abhi koi customer nahi"
          text="Website par sign up karne wale users yahan dikhai denge."
        />
      ) : (
        <section aria-label={`${customers.length} registered customers`}>
          <p className="mb-4 text-sm text-[#003366]/60">
            {customers.length} {customers.length === 1 ? "customer" : "customers"}
          </p>
          <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {customers.map((customer) => (
              <li key={customer._id} className="min-w-0 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words text-base font-semibold text-[#003366]">
                      {customer.name}
                    </h2>
                    <p className="mt-1 break-words text-sm text-[#003366]/65">
                      {customer.agencyname}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    customer.isVerified
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    {customer.isVerified ? "Verified" : "Pending verification"}
                  </span>
                </div>

                <dl className="mt-4 grid min-w-0 grid-cols-1 gap-3 border-t border-[#003366]/10 pt-4 sm:grid-cols-2">
                  <div className="flex min-w-0 items-start gap-2 text-sm text-[#003366]/75">
                    <FiMail aria-hidden="true" className="mt-0.5 shrink-0 text-[#FF6B35]" />
                    <dd className="min-w-0 break-all">{customer.email}</dd>
                  </div>
                  <div className="flex min-w-0 items-start gap-2 text-sm text-[#003366]/75">
                    <FiPhone aria-hidden="true" className="mt-0.5 shrink-0 text-[#FF6B35]" />
                    <dd className="break-words">{customer.number}</dd>
                  </div>
                  <div className="flex min-w-0 items-start gap-2 text-sm text-[#003366]/75">
                    <FiMapPin aria-hidden="true" className="mt-0.5 shrink-0 text-[#FF6B35]" />
                    <dd className="break-words">{customer.city}</dd>
                  </div>
                  <div className="text-xs text-[#003366]/50 sm:text-right">
                    Registered {formatDate(customer.createdAt)}
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
