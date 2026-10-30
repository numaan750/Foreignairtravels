"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FiMail,
  FiMapPin,
  FiPhone,
  FiShield,
  FiTrash2,
  FiUsers,
  FiUploadCloud,
} from "react-icons/fi";
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

const prepareProfileImage = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, 768 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Could not prepare this image. Please try another file."));
        return;
      }

      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not compress this image. Please try another file."));
            return;
          }
          resolve(new File([blob], "profile-image.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.8
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read this image. Please choose another file."));
    };
    image.src = objectUrl;
  });

const getProfileThumbnailUrl = (url) =>
  url.includes("/upload/")
    ? url.replace("/upload/", "/upload/c_fill,g_auto,w_112,h_112,f_auto,q_auto/")
    : url;

export default function CustomersPage() {
  const {
    getCustomers,
    approveCustomer,
    updateCustomerProfileImage,
    unverifyCustomer,
    deleteCustomer,
  } = useApp();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [busyCustomerId, setBusyCustomerId] = useState("");

  const loadCustomers = useCallback(async () => {
    const { ok, data } = await getCustomers();
    if (ok) {
      setCustomers(data.data);
      setError("");
    } else {
      setError(data.message || "Unable to load customers.");
    }
    setLoading(false);
  }, [getCustomers]);

  const handleApproval = async (customer, file) => {
    setBusyCustomerId(customer._id);
    setActionError("");
    setActionNotice("");

    const result = await approveCustomer(customer._id, file);
    if (result.data.approved) {
      const updatedCustomer = result.data.customer;
      setCustomers((current) =>
        current.map((item) =>
          item._id === customer._id
            ? {
                ...item,
                profileImage: updatedCustomer?.profileImage || item.profileImage,
                isVerified: true,
                approvalEmailSentAt: updatedCustomer?.approvalEmailSentAt || item.approvalEmailSentAt,
              }
            : item
        )
      );
    }

    if (result.ok) {
      setActionNotice(result.data.message || "Customer approved successfully.");
    } else {
      setActionError(result.data.message || "Could not approve this customer.");
    }
    setBusyCustomerId("");
  };

  const handleImageSelection = async (customer, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setActionError("Profile images must be smaller than 4 MB.");
      return;
    }

    setBusyCustomerId(customer._id);
    setActionError("");
    setActionNotice("");
    try {
      const preparedImage = await prepareProfileImage(file);
      if (customer.isVerified) {
        await handleProfileImageUpdate(customer, preparedImage);
      } else {
        await handleApproval(customer, preparedImage);
      }
    } catch (imageError) {
      setActionError(imageError.message || "Could not prepare this image.");
      setBusyCustomerId("");
    }
  };

  const handleProfileImageUpdate = async (customer, file) => {
    setBusyCustomerId(customer._id);
    setActionError("");
    setActionNotice("");

    const result = await updateCustomerProfileImage(customer._id, file);
    if (result.ok) {
      setCustomers((current) =>
        current.map((item) =>
          item._id === customer._id
            ? { ...item, profileImage: result.data.profileImage }
            : item
        )
      );
      setActionNotice(result.data.message || "Profile image updated.");
    } else {
      setActionError(result.data.message || "Could not update this profile image.");
    }
    setBusyCustomerId("");
  };

  const handleUnverify = async (customer) => {
    if (!window.confirm(`Revoke verification for ${customer.name}? They will no longer be able to sign in.`)) return;

    setBusyCustomerId(customer._id);
    setActionError("");
    setActionNotice("");
    const result = await unverifyCustomer(customer._id);
    if (result.ok) {
      setCustomers((current) =>
        current.map((item) =>
          item._id === customer._id
            ? { ...item, isVerified: false, approvalEmailSentAt: null }
            : item
        )
      );
      setActionNotice(result.data.message || "Customer verification revoked.");
    } else {
      setActionError(result.data.message || "Could not revoke customer verification.");
    }
    setBusyCustomerId("");
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`Permanently delete ${customer.name}'s account? This cannot be undone.`)) return;

    setBusyCustomerId(customer._id);
    setActionError("");
    setActionNotice("");
    const result = await deleteCustomer(customer._id);
    if (result.ok) {
      setCustomers((current) => current.filter((item) => item._id !== customer._id));
      setActionNotice(result.data.message || "Customer account deleted.");
    } else {
      setActionError(result.data.message || "Could not delete this customer.");
    }
    setBusyCustomerId("");
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadCustomers(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadCustomers]);

  return (
    <div>
      {/* <PageHeader
        title="Customers"
        description="Review signup requests, add a profile image, and approve customer accounts."
      /> */}

      {actionError && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </p>
      )}
      {actionNotice && (
        <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionNotice}
        </p>
      )}

      {loading ? (
        <div role="status" className="rounded-2xl bg-white p-6 text-sm text-[#003366]/60 shadow-sm">
          Loading customers...
        </div>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={FiUsers}
          title="No customers yet"
          text="Users who sign up on the website will appear here."
        />
      ) : (
        <section aria-label={`${customers.length} registered customers`}>
          {/* <p className="mb-4 text-sm text-[#003366]/60">
            {customers.length} {customers.length === 1 ? "customer" : "customers"}
          </p> */}
          <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {customers.map((customer) => (
              <li key={customer._id} className="min-w-0 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {customer.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getProfileThumbnailUrl(customer.profileImage)}
                        alt={`${customer.name} profile`}
                        className="size-14 shrink-0 rounded-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="grid size-14 shrink-0 place-items-center rounded-full bg-[#003366]/10 text-lg font-semibold text-[#003366]"
                      >
                        {customer.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2 className="break-words text-base font-semibold text-[#003366]">
                        {customer.name}
                      </h2>
                      <p className="mt-1 break-words text-sm text-[#003366]/65">
                        {customer.agencyname}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      customer.isVerified
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {customer.isVerified ? "Verified" : "Pending approval"}
                    </span>
                    {customer.isVerified && (
                      <span className="text-right text-[11px] text-[#003366]/50">
                        {customer.approvalEmailSentAt ? "Approval email sent" : "Approval email not sent"}
                      </span>
                    )}
                  </div>
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
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {!customer.isVerified ? (
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                      <FiUploadCloud aria-hidden="true" />
                      {busyCustomerId === customer._id ? "Uploading and approving..." : "Upload image & approve"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={Boolean(busyCustomerId)}
                        onChange={(event) => handleImageSelection(customer, event)}
                      />
                    </label>
                  ) : (
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#003366]/15 px-4 py-2.5 text-sm font-semibold text-[#003366] transition hover:bg-[#003366]/5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                      <FiUploadCloud aria-hidden="true" />
                      {busyCustomerId === customer._id ? "Updating image..." : customer.profileImage ? "Change profile image" : "Add profile image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={Boolean(busyCustomerId)}
                        onChange={(event) => handleImageSelection(customer, event)}
                      />
                    </label>
                  )}
                  {customer.isVerified && !customer.approvalEmailSentAt && (
                    <button
                      type="button"
                      className="rounded-xl border border-[#003366]/15 px-4 py-2.5 text-sm font-semibold text-[#003366] transition hover:bg-[#003366]/5 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={Boolean(busyCustomerId)}
                      onClick={() => { void handleApproval(customer); }}
                    >
                      {busyCustomerId === customer._id ? "Sending email..." : "Retry approval email"}
                    </button>
                  )}
                  {customer.isVerified && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-200 px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={Boolean(busyCustomerId)}
                      onClick={() => { void handleUnverify(customer); }}
                    >
                      <FiShield aria-hidden="true" />
                      Revoke verification
                    </button>
                  )}
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={Boolean(busyCustomerId)}
                    onClick={() => { void handleDelete(customer); }}
                  >
                    <FiTrash2 aria-hidden="true" />
                    Delete customer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
