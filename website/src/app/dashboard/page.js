'use client'

import Link from 'next/link'
import { FiArrowUpRight } from 'react-icons/fi'
import GroupTicketListing from '@/home-components/group-tickets/GroupTicketListing'
import { useApp } from '@/context/AppContext'

export default function DashboardPage() {
  const { user } = useApp()

  return (
    <div>
      {/* <h1 className="text-2xl font-bold text-[#003366] sm:text-3xl">
        Welcome, {user?.name}
      </h1> */}

      <section className="mt-7" aria-labelledby="dashboard-group-tickets-title">
        {/* <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="dashboard-group-tickets-title" className="text-xl font-semibold text-[#003366] sm:text-2xl">
              Group Bookings
            </h2>
            <p className="mt-1 text-sm text-slate-600">Explore a few of our available group flight options.</p>
          </div>
          <Link
            href="/dashboard/group-bookings"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#FF6B35] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35]"
          >
            View all group bookings <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div> */}

        <GroupTicketListing dashboardMode previewMode />
      </section>
    </div>
  )
}
