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

const getTicketGroupKey = (ticket) => {
  const airlineId = typeof ticket.airlineId === 'object' ? ticket.airlineId?._id : ticket.airlineId
  const categoryId = typeof ticket.category === 'object' ? ticket.category?._id : ticket.category
  const airlineKey = airlineId || ticket.airline?.trim().toLowerCase() || 'unknown-airline'
  const categoryKey = categoryId || ticket.category?.slug || ticket.category?.name?.trim().toLowerCase() || 'unknown-category'
  return `${airlineKey}:${categoryKey}`
}

const filterControlClass =
  'h-12 w-full rounded-xl border border-[#003366]/15 bg-white px-4 text-sm text-[#003366] outline-none transition focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/10'

function FilterField({ label, children }) {
  return (
    <label className="block min-w-0 text-sm font-medium text-[#003366]">
      {label}
      <span className="mt-1.5 block">{children}</span>
    </label>
  )
}

function FilterSelect({ value, onChange, label, children }) {
  return (
    <FilterField label={label}>
      <span className="relative block">
        <select
          value={value}
          onChange={onChange}
          aria-label={label}
          className={`${filterControlClass} appearance-none pr-12`}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#003366]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </span>
    </FilterField>
  )
}

function TicketGroupCard({ tickets, user, dashboardMode, selectedTicketId }) {
  const router = useRouter()
  const firstTicket = tickets[0]
  const airlineName = firstTicket.airlineId?.name || firstTicket.airline
  const airlineLogo = firstTicket.airlineId?.logo || firstTicket.airlineLogo

  const handleBook = (ticket) => {
    const bookingUrl = ticket.bookingUrl && /^https?:\/\//i.test(ticket.bookingUrl)
      ? ticket.bookingUrl
      : `https://wa.me/966596382847?text=${encodeURIComponent(`Hello, I would like to book ${ticket.groupName} on ${formatDate(ticket.departureDate)}.`)}`
    const loginDestination = `/dashboard/group-bookings?ticketId=${encodeURIComponent(ticket._id)}`

    if (dashboardMode) {
      window.open(bookingUrl, '_blank', 'noopener,noreferrer')
      return
    }
    router.push(user ? loginDestination : `/login?returnTo=${encodeURIComponent(loginDestination)}`)
  }

  return (
    <article className={`overflow-hidden rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,51,102,0.06)] ${tickets.some((ticket) => ticket._id === selectedTicketId) ? 'border-[#FF6B35] ring-2 ring-[#FF6B35]/15' : 'border-slate-200'}`}>
      <div className="relative flex min-w-0 flex-wrap items-center justify-center gap-x-5 gap-y-2 border-b border-slate-100 px-4 py-2.5 sm:px-5">
        <div className="flex min-w-0 items-center justify-center gap-2.5">
          {airlineLogo
            ? <img src={airlineLogo} alt="" className="size-11 shrink-0 rounded-lg border border-slate-100 object-contain p-1.5" />
            : <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#003366]/5 text-sm font-bold text-[#003366]">{airlineName?.slice(0, 2).toUpperCase()}</span>}
          <p className="truncate text-sm font-semibold text-[#003366] sm:text-base">{airlineName}</p>
        </div>
        <div className="flex min-w-0 items-center gap-2 sm:absolute sm:right-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#FF6B35]">{firstTicket.category?.name}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
            {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
          </span>
        </div>
      </div>

      {tickets.map((ticket, ticketIndex) => {
        const selected = ticket._id === selectedTicketId
        return (
          <div key={ticket._id} className={ticketIndex > 0 ? 'border-t border-slate-200' : ''}>
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-5 gap-y-1 px-4 py-2.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-[13px] font-semibold text-[#003366]">{ticket.groupName}</p>
                {selected && <span className="shrink-0 rounded-full bg-[#FF6B35]/10 px-2.5 py-1 text-[10px] font-semibold text-[#FF6B35]">Selected ticket</span>}
              </div>
              <p className="flex items-center gap-1 text-[11px] text-slate-500"><FiCalendar aria-hidden="true" />{formatDate(ticket.departureDate)}</p>
            </div>

            <div className="grid min-w-0 grid-cols-2 divide-x divide-y divide-slate-100 border-t border-slate-100 md:grid-cols-4 md:divide-y-0 xl:grid-cols-[1.35fr_1fr_1fr_1.15fr_auto]">
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
                <button type="button" onClick={() => handleBook(ticket)} className="inline-flex min-h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#FF6B35] px-4 text-xs font-semibold text-white transition hover:bg-[#003366] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35]">
                  <FiShoppingCart aria-hidden="true" />{dashboardMode ? 'Contact to book' : 'Book Now'}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </article>
  )
}

export default function GroupTicketListing({ slug = '', dashboardMode = false }) {
  const { getGroupTickets, getGroupTicketCategories, getAirlines, user } = useApp()
  const [categories, setCategories] = useState([])
  const [airlines, setAirlines] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTicketId, setSelectedTicketId] = useState('')
  const [dashboardCategory, setDashboardCategory] = useState('')
  const [websiteCategory, setWebsiteCategory] = useState(slug)
  const [selectedAirlineId, setSelectedAirlineId] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const categoryFilter = dashboardMode ? dashboardCategory : websiteCategory

  const loadPage = useCallback(async () => {
    setLoading(true)
    setError('')
    const [categoryResult, ticketResult, airlineResult] = await Promise.all([
      getGroupTicketCategories(),
      getGroupTickets(categoryFilter || undefined),
      getAirlines(),
    ])

    if (!categoryResult.ok) {
      setError(categoryResult.data.message || 'Categories could not be loaded.')
    } else if (!ticketResult.ok) {
      setError(ticketResult.data.message || 'Group tickets could not be loaded.')
    } else if (!airlineResult.ok) {
      setError(airlineResult.data.message || 'Airlines could not be loaded.')
    } else {
      setCategories(categoryResult.data.data)
      setTickets(ticketResult.data.data)
      setAirlines(airlineResult.data.data)
      if (categoryFilter && !categoryResult.data.data.some((category) => category.slug === categoryFilter)) {
        setError('This group ticket category is not available.')
      }
    }
    setLoading(false)
  }, [categoryFilter, getAirlines, getGroupTicketCategories, getGroupTickets])

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
  const airlineFilteredTickets = selectedAirlineId
    ? tickets.filter((ticket) => {
      const ticketAirlineId = typeof ticket.airlineId === 'object' ? ticket.airlineId?._id : ticket.airlineId
      const selectedAirline = airlines.find((airline) => airline._id === selectedAirlineId)
      return ticketAirlineId === selectedAirlineId || (!ticketAirlineId && ticket.airline === selectedAirline?.name)
    })
    : tickets
  const dateAndTimeFilteredTickets = airlineFilteredTickets.filter((ticket) => {
    if (departureDate) {
      const ticketDate = new Date(ticket.departureDate)
      if (Number.isNaN(ticketDate.getTime()) || ticketDate.toISOString().slice(0, 10) !== departureDate) {
        return false
      }
    }
    if (departureTime && !ticket.segments.some((segment) => segment.departureTime === departureTime)) {
      return false
    }
    return true
  })
  const displayedTickets = selectedTicketId
    ? [...dateAndTimeFilteredTickets].sort((first, second) => Number(second._id === selectedTicketId) - Number(first._id === selectedTicketId))
    : dateAndTimeFilteredTickets
  const ticketGroups = displayedTickets.reduce((groups, ticket) => {
    const key = getTicketGroupKey(ticket)
    const existingGroup = groups.find((group) => group.key === key)
    if (existingGroup) existingGroup.tickets.push(ticket)
    else groups.push({ key, tickets: [ticket] })
    return groups
  }, [])

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

        <div className={`${dashboardMode ? 'mb-6' : 'mt-7 mb-6'} grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4`}>
          <FilterSelect
            label="Filter by category"
            value={categoryFilter}
            onChange={(event) => {
              if (dashboardMode) {
                setDashboardCategory(event.target.value)
                setSelectedTicketId('')
              } else {
                setWebsiteCategory(event.target.value)
              }
            }}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category.slug}>{category.name}</option>
            ))}
          </FilterSelect>

          <FilterSelect
            label="Filter by airline"
            value={selectedAirlineId}
            onChange={(event) => setSelectedAirlineId(event.target.value)}
          >
            <option value="">All airlines</option>
            {airlines.map((airline) => (
              <option key={airline._id} value={airline._id}>{airline.name}</option>
            ))}
          </FilterSelect>

          <FilterField label="Departure date">
            <input
              type="date"
              value={departureDate}
              onChange={(event) => setDepartureDate(event.target.value)}
              className={filterControlClass}
            />
          </FilterField>

          <FilterField label="Departure time">
            <input
              type="time"
              step={60}
              value={departureTime}
              onChange={(event) => setDepartureTime(event.target.value)}
              aria-label="Departure time"
              className={filterControlClass}
            />
          </FilterField>
        </div>

        <section aria-label="Group ticket listings" className={`${dashboardMode ? 'mt-0' : 'mt-6'} space-y-3`}>
          {loading ? <p className="rounded-2xl bg-white p-6 text-sm text-slate-600">Loading group tickets...</p>
            : error ? <p role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">{error}</p>
              : displayedTickets.length === 0 ? <p className="rounded-2xl bg-white p-6 text-sm text-slate-600">{selectedAirlineId || departureDate || departureTime ? 'No tickets match the selected filters.' : 'No group tickets are available right now. Please check again soon.'}</p>
                : ticketGroups.map((group) => (
                  <TicketGroupCard
                    key={group.key}
                    tickets={group.tickets}
                    user={user}
                    dashboardMode={dashboardMode}
                    selectedTicketId={selectedTicketId}
                  />
                ))}
        </section>
      </div>
    </main>
  )
}
