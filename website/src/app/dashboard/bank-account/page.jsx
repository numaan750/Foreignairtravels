'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useApp } from '@/context/AppContext'

function Detail({ label, value }) {
  if (!value) return null

  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{label}</p>
      <p className="mt-1 break-words text-sm text-slate-700">{value}</p>
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
      <h1 className="border-b border-gray-500 pb-3 text-base font-medium uppercase text-slate-700">
        Bank Details
      </h1>

      {loading ? (
        <div className="mt-6 rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading...
        </div>
      ) : accounts.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
          No bank accounts available yet.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {accounts.map((item) => (
            <div
              key={item._id}
              className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_2px_6px_rgba(0,51,102,0.12)]"
            >
              <div className="relative w-full overflow-hidden bg-white h-45">
                <span className="absolute inset-0">
                  <Image
                    src={item.logo}
                    alt={`${item.bankName} logo`}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-contain p-2"
                  />
                </span>
              </div>

              <h2 className="mt-3 truncate text-base font-bold text-slate-700">
                {item.bankName}
              </h2>

              <div className="mt-2 space-y-3">
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