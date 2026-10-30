'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { FiLayers } from 'react-icons/fi'
import { useApp } from '@/context/AppContext'

const getCategoryImageUrl = (url) =>
  url?.includes('/upload/')
    ? url.replace('/upload/', '/upload/f_auto,q_auto,w_1280,c_limit/')
    : url

export default function DashboardPage() {
  const { getGroupTicketCategories } = useApp()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCategories = useCallback(async () => {
    const { ok, data } = await getGroupTicketCategories()
    if (ok) {
      setCategories(data.data)
      setError('')
    } else {
      setError(data.message || 'Unable to load categories.')
    }
    setLoading(false)
  }, [getGroupTicketCategories])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadCategories() })
    return () => window.cancelAnimationFrame(frame)
  }, [loadCategories])

  return (
    <div>
      <section className="mt-7" aria-labelledby="dashboard-categories-title">
        {/* <div className="mb-5">
          <h1 id="dashboard-categories-title" className="text-2xl font-semibold text-[#003366] sm:text-3xl">
            Group Booking Categories
          </h1>
          <p className="mt-1 text-sm text-slate-600">Choose a category to view its available group bookings.</p>
        </div> */}

        {loading ? <p className="rounded-2xl bg-white p-6 text-sm text-slate-600">Loading categories...</p>
          : error ? <p role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">{error}</p>
            : categories.length === 0 ? <p className="rounded-2xl bg-white p-6 text-sm text-slate-600">No group booking categories are available right now.</p>
              : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => (
                  <Link
                    key={category._id}
                    href={`/dashboard/group-bookings?category=${encodeURIComponent(category.slug)}`}
                    aria-label={`View ${category.name} group bookings`}
                    className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-[#003366] to-[#176b9b] shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF6B35]"
                  >
                    {category.image || category.logo
                      ? <Image src={getCategoryImageUrl(category.image || category.logo)} alt="" fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                      : <FiLayers aria-hidden="true" className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 text-white/20" />}
                    <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <span className="absolute inset-x-4 bottom-5 text-center text-xl font-bold text-white drop-shadow sm:text-2xl">
                      {category.name}
                    </span>
                  </Link>
                ))}
              </div>}
      </section>
    </div>
  )
}
