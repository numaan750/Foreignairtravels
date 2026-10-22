'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiArrowUpRight, FiClock, FiMapPin } from 'react-icons/fi'
import { useApp } from '@/context/AppContext'

export default function DashboardPage() {
  const { user, getPackages } = useApp()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPackages = useCallback(async () => {
    const result = await getPackages()
    if (result.ok) setPackages(result.data.data)
    else setError(result.data.message || 'Unable to load packages.')
    setLoading(false)
  }, [getPackages])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadPackages() })
    return () => window.cancelAnimationFrame(frame)
  }, [loadPackages])

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#003366] sm:text-3xl">
        Welcome, {user?.name}
      </h1>

      <section className="mt-7" aria-labelledby="dashboard-packages-title">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="dashboard-packages-title" className="text-xl font-semibold text-[#003366] sm:text-2xl">
              Travel Packages
            </h2>
            <p className="mt-1 text-sm text-slate-600">Explore our available travel packages.</p>
          </div>
          <Link
            href="/packeges#packages"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#FF6B35] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35]"
          >
            View all packages <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <p role="status" className="rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading packages...
          </p>
        ) : error ? (
          <p role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
            {error}
          </p>
        ) : packages.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm">
            No travel packages are available right now.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {packages.map((item) => (
              <li key={item._id} className="min-w-0">
                <Link
                  href="/dashboard/group-bookings"
                  aria-label={`View group bookings for ${item.title}`}
                  className="flex h-full flex-col overflow-hidden rounded-xl border border-[#003366]/10 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35]"
                >
                  <div className="relative h-44 overflow-hidden bg-[#003366]/5 sm:h-48">
                    <Image
                      src={item.image}
                      alt={`${item.title} travel package`}
                      fill
                      sizes="(min-width: 1536px) 30vw, (min-width: 640px) 45vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <p className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-500">
                      <FiMapPin aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                      <span className="truncate">{item.location}</span>
                    </p>
                    <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-[#003366]">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">
                      {item.description}
                    </p>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 mt-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <FiClock aria-hidden="true" className="text-[#FF6B35]" />
                        {item.days} days / {item.nights} nights
                      </span>
                      <span className="text-sm font-semibold text-[#003366]">
                        {item.currency} {Number(item.price || 0).toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}