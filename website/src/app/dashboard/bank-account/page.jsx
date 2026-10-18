'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useApp } from '@/context/AppContext'

function Detail({ label, value }) {
  if (!value) return null

  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#003366]">{value}</p>
    </div>
  )
}

export default function BankAccountPage() {
  const { getBankAccounts } = useApp()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { ok, data } = await getBankAccounts()
      if (ok) setAccounts(data.data)
      setLoading(false)
    }
    load()
  }, [getBankAccounts])

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#003366] sm:text-3xl">Bank Account</h1>
      <p className="mt-1 text-sm text-slate-600">
        You can send your payment to any of the accounts below.
      </p>

      {loading ? (
        <div className="mt-6 rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading...
        </div>
      ) : accounts.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
          No bank accounts available yet.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {accounts.map((item) => (
            <div key={item._id} className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-[#003366]/10 bg-white">
                  <Image
                    src={item.logo}
                    alt={`${item.bankName} logo`}
                    fill
                    sizes="44px"
                    className="object-contain p-1"
                  />
                </span>
                <h2 className="min-w-0 truncate text-lg font-semibold text-[#003366]">
                  {item.bankName}
                </h2>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[#003366]/10 pt-5 sm:grid-cols-2">
                <Detail label="Account holder" value={item.accountHolder} />
                <Detail label="Account number" value={item.accountNumber} />
                <Detail label="IBAN" value={item.iban} />
                <Detail label="Beneficiary" value={item.beneficiary} />
                <Detail label="Branch" value={item.branch} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}