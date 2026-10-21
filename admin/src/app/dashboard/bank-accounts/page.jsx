"use client";

import { useCallback, useEffect, useState } from "react";
import { FiCreditCard, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import BankAccountForm from "@/components/dashboard/BankAccountForm";
import { useApp } from "@/context/AppContext";

export default function BankAccountsPage() {
  const { getBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount } = useApp();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadAccounts = useCallback(async () => {
    const { ok, data } = await getBankAccounts();
    if (ok) {
      setAccounts(data.data);
      setListError("");
    } else {
      setListError(data.message || "Bank accounts load nahi ho sake");
    }
    setLoading(false);
  }, [getBankAccounts]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const openCreate = () => {
    setEditing(null);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const handleSubmit = async (body) => {
    setSaving(true);
    setFormError("");

    const { ok, data } = editing
      ? await updateBankAccount(editing._id, body)
      : await createBankAccount(body);

    setSaving(false);

    if (!ok) {
      setFormError(data.message || "Save nahi ho saka");
      return;
    }

    closeForm();
    loadAccounts();
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`"${item.bankName}" delete karna hai?`)) return;

    const { ok, data } = await deleteBankAccount(item._id);
    if (!ok) {
      alert(data.message || "Delete nahi ho saka");
      return;
    }
    loadAccounts();
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5">
        <PageHeader title="Bank Accounts" description="Payment receive karne wale accounts yahan manage honge." className="mb-0" />
        <button
          onClick={openCreate}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <FiPlus /> Add account
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#003366]/60">Loading...</p>
      ) : listError ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{listError}</p>
      ) : accounts.length === 0 ? (
        <EmptyState icon={FiCreditCard} title="Abhi koi bank account nahi" text="Upar Add account se pehla account banao." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((item) => (
            <div key={item._id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.logo} alt={item.bankName} className="size-12 shrink-0 rounded-lg border border-[#003366]/10 object-contain p-1" />
                <h3 className="min-w-0 truncate text-base font-semibold text-[#003366]">{item.bankName}</h3>
              </div>

              <p className="mt-3 truncate text-sm text-[#003366]/80">{item.accountHolder}</p>
              <p className="mt-1 truncate text-sm text-[#003366]/60">{item.accountNumber}</p>
              <p className="mt-1 truncate text-xs text-[#003366]/60">{item.iban}</p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => openEdit(item)}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#EDEEE9] py-2 text-sm font-medium text-[#003366] transition hover:bg-[#003366] hover:text-white"
                >
                  <FiEdit2 /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-50 py-2 text-sm font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <BankAccountForm
          key={editing?._id || "new"}
          initial={editing}
          saving={saving}
          error={formError}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}
    </div>
  );
}