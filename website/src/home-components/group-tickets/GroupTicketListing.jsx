'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { FiCalendar, FiClock, FiMapPin, FiShoppingCart } from 'react-icons/fi'
import { useApp } from '@/context/AppContext'

const formatDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

const fare = (currency, value) =>
  `${currency} ${Number(value || 0).toLocaleString('en-US')}`

function TicketCard({ ticket }) {
  const bookingHref = ticket.bookingUrl || `https://wa.me/966596382847?text=${encodeURIComponent(`Hello, I would like to book ${ticket.groupName} on ${formatDate(ticket.departureDate)}.`)}`

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(0,51,102,0.07)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {ticket.airlineLogo
            ? <img src={ticket.airlineLogo} alt="" className="size-12 shrink-0 rounded-xl border border-slate-100 object-contain p-1.5" />
            : <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#003366]/5 text-sm font-bold text-[#003366]">{ticket.airline?.slice(0, 2).toUpperCase()}</span>}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#003366]">{ticket.airline}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500"><FiCalendar aria-hidden="true" />{formatDate(ticket.departureDate)}</p>
          </div>
        </div>
        <div className="min-w-0 text-left sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#FF6B35]">{ticket.category?.name}</p>
          <h2 className="mt-1 text-base font-semibold text-[#003366]">{ticket.groupName}</h2>
        </div>
      </div>

      <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5">
        <div className="px-5 py-4 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Flight</p>
          <div className="mt-2 space-y-2">
            {ticket.segments.map((segment, index) => (
              <div key={`${segment.flightNumber}-${index}`} className="text-sm text-[#003366]">
                <p className="flex items-center gap-1.5 font-medium"><FiMapPin aria-hidden="true" className="shrink-0 text-[#FF6B35]" />{segment.from} → {segment.to}</p>
                <p className="mt-1 pl-5 text-xs text-slate-500">{segment.flightNumber}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 py-4 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Time</p>
          <div className="mt-2 space-y-2">
            {ticket.segments.map((segment, index) => (
              <p key={`${segment.flightNumber}-time-${index}`} className="flex items-center gap-1.5 text-sm text-[#003366]">
                <FiClock aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                {segment.departureTime || 'TBA'}{segment.arrivalTime ? ` – ${segment.arrivalTime}` : ''}
              </p>
            ))}
          </div>
        </div>
        <div className="px-5 py-4 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Baggage & meal</p>
          <p className="mt-2 text-sm font-medium text-[#003366]">{ticket.baggage}</p>
          <p className={`mt-1 text-sm font-medium ${ticket.mealAvailable ? 'text-emerald-600' : 'text-slate-500'}`}>
            Meal {ticket.mealAvailable ? 'included' : 'not included'}
          </p>
        </div>
        <div className="px-5 py-4 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Fare</p>
          <p className="mt-2 text-sm font-semibold text-[#003366]">Adult · {fare(ticket.currency, ticket.adultFare)}</p>
          <p className="mt-1 text-xs text-slate-500">Child · {fare(ticket.currency, ticket.childFare)}</p>
          <p className="mt-1 text-xs text-slate-500">Infant · {ticket.infantPriceOnCall ? 'Price on call' : fare(ticket.currency, ticket.infantFare)}</p>
        </div>
        <div className="flex items-center px-5 py-4 sm:col-span-2 sm:px-6 lg:col-span-1">
          <a
            href={bookingHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#FF6B35] px-5 text-sm font-semibold text-white transition hover:bg-[#003366] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF6B35]"
          >
            <FiShoppingCart aria-hidden="true" /> Book Now
          </a>
        </div>
      </div>
    </article>
  )
}

export default function GroupTicketListing({ slug = '' }) {
  const { getGroupTickets, getGroupTicketCategories } = useApp()
  const [categories, setCategories] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPage = useCallback(async () => {
    setLoading(true)
    setError('')
    const [categoryResult, ticketResult] = await Promise.all([
      getGroupTicketCategories(),
      getGroupTickets(slug || undefined),
    ])

    if (!categoryResult.ok) {
      setError(categoryResult.data.message || 'Categories could not be loaded.')
    } else if (!ticketResult.ok) {
      setError(ticketResult.data.message || 'Group tickets could not be loaded.')
    } else {
      setCategories(categoryResult.data.data)
      setTickets(ticketResult.data.data)
      if (slug && !categoryResult.data.data.some((category) => category.slug === slug)) {
        setError('This group ticket category is not available.')
      }
    }
    setLoading(false)
  }, [getGroupTicketCategories, getGroupTickets, slug])

  useEffect(() => { loadPage() }, [loadPage])

  const selectedCategory = categories.find((category) => category.slug === slug)

  return (
    <main className="flex-1 bg-[#f5f3ed] py-10 sm:py-14 lg:py-20">
      <div className="mycontainer">
        <header className="max-w-3xl">
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#003366] sm:text-4xl lg:text-5xl">
            {selectedCategory?.name || (slug ? 'Group Tickets' : 'Available Group Tickets')}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Compare group flight dates, routes, baggage and fares. Contact our team to confirm availability.
          </p>
        </header>

        {!slug && categories.length > 0 && (
          <nav aria-label="Group ticket categories" className="mt-7 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link key={category._id} href={`/group-tickets/${category.slug}`} className="rounded-full border border-[#003366]/15 bg-white px-4 py-2 text-sm font-medium text-[#003366] transition hover:border-[#FF6B35] hover:text-[#FF6B35]">
                {category.name}
              </Link>
            ))}
          </nav>
        )}

        <section aria-label="Group ticket listings" className="mt-8 space-y-4 sm:mt-10">
          {loading ? <p className="rounded-2xl bg-white p-6 text-sm text-slate-600">Loading group tickets...</p>
            : error ? <p role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">{error}</p>
              : tickets.length === 0 ? <p className="rounded-2xl bg-white p-6 text-sm text-slate-600">No group tickets are available right now. Please check again soon.</p>
                : tickets.map((ticket) => <TicketCard key={ticket._id} ticket={ticket} />)}
        </section>
      </div>
    </main>
  )
}
