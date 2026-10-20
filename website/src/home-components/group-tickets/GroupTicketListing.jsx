'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

function TicketCard({ ticket, user, dashboardMode, selected }) {
  const router = useRouter()
  const bookingUrl = ticket.bookingUrl && /^https?:\/\//i.test(ticket.bookingUrl)
    ? ticket.bookingUrl
    : `https://wa.me/966596382847?text=${encodeURIComponent(`Hello, I would like to book ${ticket.groupName} on ${formatDate(ticket.departureDate)}.`)}`
  const loginDestination = `/dashboard/group-bookings?ticketId=${encodeURIComponent(ticket._id)}`

  const handleBook = () => {
    if (dashboardMode) {
      window.open(bookingUrl, '_blank', 'noopener,noreferrer')
      return
    }
    router.push(user ? loginDestination : `/login?returnTo=${encodeURIComponent(loginDestination)}`)
  }

  return (
    <article className={`overflow-hidden rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,51,102,0.06)] ${selected ? 'border-[#FF6B35] ring-2 ring-[#FF6B35]/15' : 'border-slate-200'}`}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-slate-100 px-4 py-2.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          {ticket.airlineLogo
            ? <img src={ticket.airlineLogo} alt="" className="size-9 shrink-0 rounded-lg border border-slate-100 object-contain p-1" />
            : <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#003366]/5 text-xs font-bold text-[#003366]">{ticket.airline?.slice(0, 2).toUpperCase()}</span>}
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-[#003366]">{ticket.airline}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500"><FiCalendar aria-hidden="true" />{formatDate(ticket.departureDate)}</p>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          {selected && <span className="rounded-full bg-[#FF6B35]/10 px-2.5 py-1 text-[10px] font-semibold text-[#FF6B35]">Selected ticket</span>}
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.1em] text-[#FF6B35] sm:inline">{ticket.category?.name}</span>
          <h2 className="max-w-full truncate text-[13px] font-semibold text-[#003366] sm:text-right">{ticket.groupName}</h2>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-2 divide-x divide-y divide-slate-100 md:grid-cols-4 md:divide-y-0 xl:grid-cols-[1.35fr_1fr_1fr_1.15fr_auto]">
        <div className="min-w-0 px-4 py-2.5 sm:px-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">Flight</p>
          <div className="mt-1 space-y-1">
            {ticket.segments.map((segment, index) => (
              <div key={`${segment.flightNumber}-${index}`} className="min-w-0 text-[11px] leading-4 text-[#003366]">
                <p className="flex min-w-0 items-center gap-1 font-medium"><FiMapPin aria-hidden="true" className="shrink-0 text-[#FF6B35]" /><span className="truncate">{segment.from} → {segment.to}</span></p>
                <p className="truncate pl-4 text-[10px] text-slate-500">{segment.flightNumber}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="min-w-0 px-4 py-2.5 sm:px-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">Time</p>
          <div className="mt-1 space-y-1">
            {ticket.segments.map((segment, index) => (
              <p key={`${segment.flightNumber}-time-${index}`} className="flex min-w-0 items-center gap-1 text-[11px] text-[#003366]">
                <FiClock aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                <span className="truncate">{segment.departureTime || 'TBA'}{segment.arrivalTime ? ` – ${segment.arrivalTime}` : ''}</span>
              </p>
            ))}
          </div>
        </div>
        <div className="min-w-0 px-4 py-2.5 sm:px-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">Baggage & meal</p>
          <p className="mt-1 truncate text-[11px] font-medium text-[#003366]">{ticket.baggage}</p>
          <p className={`mt-0.5 text-[11px] font-medium ${ticket.mealAvailable ? 'text-emerald-600' : 'text-slate-500'}`}>Meal {ticket.mealAvailable ? 'yes' : 'no'}</p>
        </div>
        <div className="min-w-0 px-4 py-2.5 sm:px-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">Fare</p>
          <p className="mt-1 truncate text-[11px] font-semibold text-[#003366]">Adult · {fare(ticket.currency, ticket.adultFare)}</p>
          <p className="truncate text-[10px] text-slate-500">Child · {fare(ticket.currency, ticket.childFare)}</p>
          <p className="truncate text-[10px] text-slate-500">Infant · {ticket.infantPriceOnCall ? 'Price on call' : fare(ticket.currency, ticket.infantFare)}</p>
        </div>
        <div className="col-span-2 flex items-center px-4 py-2.5 md:col-span-4 xl:col-span-1 sm:px-5">
          <button type="button" onClick={handleBook} className="inline-flex min-h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#FF6B35] px-4 text-xs font-semibold text-white transition hover:bg-[#003366] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35]">
            <FiShoppingCart aria-hidden="true" />{dashboardMode ? 'Contact to book' : 'Book Now'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default function GroupTicketListing({ slug = '', dashboardMode = false }) {
  const { getGroupTickets, getGroupTicketCategories, user } = useApp()
  const [categories, setCategories] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTicketId, setSelectedTicketId] = useState('')
  const [dashboardCategory, setDashboardCategory] = useState('')
  const [websiteCategory, setWebsiteCategory] = useState(slug)
  const categoryFilter = dashboardMode ? dashboardCategory : websiteCategory

  const loadPage = useCallback(async () => {
    setLoading(true)
    setError('')
    const [categoryResult, ticketResult] = await Promise.all([
      getGroupTicketCategories(),
      getGroupTickets(categoryFilter || undefined),
    ])

    if (!categoryResult.ok) {
      setError(categoryResult.data.message || 'Categories could not be loaded.')
    } else if (!ticketResult.ok) {
      setError(ticketResult.data.message || 'Group tickets could not be loaded.')
    } else {
      setCategories(categoryResult.data.data)
      setTickets(ticketResult.data.data)
      if (categoryFilter && !categoryResult.data.data.some((category) => category.slug === categoryFilter)) {
        setError('This group ticket category is not available.')
      }
    }
    setLoading(false)
  }, [categoryFilter, getGroupTicketCategories, getGroupTickets])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadPage() })
    return () => window.cancelAnimationFrame(frame)
  }, [loadPage])

  useEffect(() => {
    if (!dashboardMode) return
    const frame = window.requestAnimationFrame(() => {
      setSelectedTicketId(new URLSearchParams(window.location.search).get('ticketId') || '')
    })
    return () => window.cancelAnimationFrame(frame)
  }, [dashboardMode])

  const selectedCategory = categories.find((category) => category.slug === categoryFilter)
  const displayedTickets = selectedTicketId
    ? [...tickets].sort((first, second) => Number(second._id === selectedTicketId) - Number(first._id === selectedTicketId))
    : tickets

  return (
    <main className={`${dashboardMode ? '' : 'flex-1 bg-[#f5f3ed] py-6 sm:py-8'}`}>
      <div className={dashboardMode ? 'w-full max-w-none' : 'mycontainer'}>
        {!dashboardMode && <header className="max-w-3xl">
          <h1 className={`${dashboardMode ? 'text-2xl sm:text-3xl' : 'mt-4 text-3xl sm:text-4xl lg:text-5xl'} font-semibold tracking-[-0.04em] text-[#003366]`}>
            {selectedCategory?.name || (slug ? 'Group Tickets' : 'Available Group Tickets')}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Compare group flight dates, routes, baggage and fares. Contact our team to confirm availability.
          </p>
        </header>}

        {categories.length > 0 && (
          <nav aria-label="Group ticket categories" className={`${dashboardMode ? 'mt-0 mb-6' : 'mt-7 mb-6'} flex flex-wrap gap-2`}>
            <button
              type="button"
              onClick={() => {
                if (dashboardMode) {
                  setDashboardCategory('')
                  setSelectedTicketId('')
                } else {
                  setWebsiteCategory('')
                }
              }}
              aria-pressed={!categoryFilter}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${!categoryFilter ? 'border-[#FF6B35] bg-[#FF6B35] text-white' : 'border-[#003366]/15 bg-white text-[#003366] hover:border-[#FF6B35] hover:text-[#FF6B35]'}`}
            >
              All categories
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                type="button"
                onClick={() => {
                  if (dashboardMode) {
                    setDashboardCategory(category.slug)
                    setSelectedTicketId('')
                  } else {
                    setWebsiteCategory(category.slug)
                  }
                }}
                aria-pressed={categoryFilter === category.slug}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${categoryFilter === category.slug ? 'border-[#FF6B35] bg-[#FF6B35] text-white' : 'border-[#003366]/15 bg-white text-[#003366] hover:border-[#FF6B35] hover:text-[#FF6B35]'}`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        )}

        <section aria-label="Group ticket listings" className={`${dashboardMode ? 'mt-0' : 'mt-6'} space-y-3`}>
          {loading ? <p className="rounded-2xl bg-white p-6 text-sm text-slate-600">Loading group tickets...</p>
            : error ? <p role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">{error}</p>
              : tickets.length === 0 ? <p className="rounded-2xl bg-white p-6 text-sm text-slate-600">No group tickets are available right now. Please check again soon.</p>
                : displayedTickets.map((ticket) => <TicketCard key={ticket._id} ticket={ticket} user={user} dashboardMode={dashboardMode} selected={ticket._id === selectedTicketId} />)}
        </section>
      </div>
    </main>
  )
}
