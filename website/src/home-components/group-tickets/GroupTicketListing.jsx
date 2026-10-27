'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiCalendar, FiClock, FiShoppingCart } from 'react-icons/fi'
import { FaPlaneArrival, FaPlaneDeparture } from 'react-icons/fa'
import { useApp } from '@/context/AppContext'
import GroupTicketBookingModal from './GroupTicketBookingModal'

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
          className={`dropdown-select ${filterControlClass} appearance-none pr-12`}
        >
          {children}
        </select>
      </span>
    </FilterField>
  )
}

function TicketGroupCard({ tickets, dashboardMode, selectedTicketId, onBook }) {
  const firstTicket = tickets[0]
  const airlineName = firstTicket.airlineId?.name || firstTicket.airline
  const airlineLogo = firstTicket.airlineId?.logo || firstTicket.airlineLogo
  const detailsPadding = dashboardMode ? 'px-4 py-4 sm:px-5 sm:py-5' : 'px-4 py-2.5 sm:px-5'

  return (
    <article className={`overflow-hidden rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,51,102,0.06)] ${tickets.some((ticket) => ticket._id === selectedTicketId) ? 'border-[#FF6B35] ring-2 ring-[#FF6B35]/15' : 'border-slate-200'}`}>
      <div className="grid min-w-0 grid-cols-[1fr_auto_1fr] items-center border-b border-slate-100 px-3 py-2.5 sm:px-5">
        <div className="col-start-2 flex min-w-0 items-center justify-center gap-2.5">
          {airlineLogo
            ? <img src={airlineLogo} alt="" className="size-14 shrink-0 object-contain" />
            : <span className="flex size-14 shrink-0 items-center justify-center text-sm font-bold text-[#003366]">{airlineName?.slice(0, 2).toUpperCase()}</span>}
          <p className="truncate text-sm font-semibold leading-5 text-[#003366] sm:text-base">{airlineName}</p>
          <span className="shrink-0 whitespace-nowrap text-center text-xs font-semibold uppercase leading-5 tracking-[0.1em] text-[#FF6B35]">
          {firstTicket.category?.name}
          </span>
        </div>
        <span className="col-start-3 justify-self-end whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
        </span>
      </div>

      {tickets.map((ticket, ticketIndex) => {
        const selected = ticket._id === selectedTicketId
        return (
          <div key={ticket._id} className={ticketIndex > 0 ? 'border-t border-slate-200' : ''}>
            <div className={`flex min-w-0 flex-wrap items-center justify-between gap-x-5 gap-y-1 px-4 ${dashboardMode ? 'py-3 sm:py-4' : 'py-2.5'} sm:px-5`}>
              <div className="flex min-w-0 items-center gap-2">
                <FaPlaneDeparture aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                <p className="break-words text-sm font-semibold leading-5 text-[#003366]">{ticket.groupName}</p>
                {selected && <span className="shrink-0 rounded-full bg-[#FF6B35]/10 px-2.5 py-1 text-[10px] font-semibold text-[#FF6B35]">Selected ticket</span>}
              </div>
              <p className="flex items-center gap-1 text-xs text-slate-500"><FiCalendar aria-hidden="true" />{formatDate(ticket.departureDate)}</p>
            </div>

            <div className="grid min-w-0 grid-cols-2 divide-x divide-y divide-slate-100 border-t border-slate-100 md:grid-cols-4 md:divide-y-0 xl:grid-cols-[1.35fr_1fr_1fr_1.15fr_auto]">
              <div className={`min-w-0 ${detailsPadding}`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Flight</p>
                <div className={`mt-1 ${dashboardMode ? 'space-y-2' : 'space-y-1'}`}>
                  {ticket.segments.map((segment, index) => (
                    <div key={`${segment.flightNumber}-${index}`} className="min-w-0 text-xs leading-5 text-[#003366]">
                      <p className="flex min-w-0 flex-wrap items-center gap-1 font-medium">
                        <FaPlaneDeparture aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                        <span className="break-words">{segment.from}</span>
                        <FaPlaneArrival aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                        <span className="break-words">{segment.to}</span>
                      </p>
                      <p className="break-words pl-4 text-[11px] text-slate-500">{segment.flightNumber}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`min-w-0 ${detailsPadding}`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Time</p>
                <div className={`mt-1 ${dashboardMode ? 'space-y-2' : 'space-y-1'}`}>
                  {ticket.segments.map((segment, index) => (
                    <p key={`${segment.flightNumber}-time-${index}`} className="flex min-w-0 items-start gap-1 text-xs leading-5 text-[#003366]">
                      <FiClock aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                      <span className="break-words">{segment.departureTime || 'TBA'}{segment.arrivalTime ? ` – ${segment.arrivalTime}` : ''}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className={`min-w-0 ${detailsPadding}`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Baggage & meal</p>
                <p className="mt-1 break-words text-xs font-medium leading-5 text-[#003366]">{ticket.baggage}</p>
                <p className={`mt-0.5 text-xs font-medium ${ticket.mealAvailable ? 'text-emerald-600' : 'text-slate-500'}`}>Meal {ticket.mealAvailable ? 'yes' : 'no'}</p>
              </div>
              <div className={`min-w-0 ${detailsPadding}`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Fare</p>
                <p className="mt-1 break-words text-xs font-semibold leading-5 text-[#003366]">Adult · {fare(ticket.currency, ticket.adultFare)}</p>
                <p className="break-words text-[11px] leading-5 text-slate-500">Child · {fare(ticket.currency, ticket.childFare)}</p>
                <p className="break-words text-[11px] leading-5 text-slate-500">Infant · {ticket.infantPriceOnCall ? 'Price on call' : fare(ticket.currency, ticket.infantFare)}</p>
              </div>
              <div className={`col-span-2 flex items-center px-4 md:col-span-4 xl:col-span-1 sm:px-5 ${dashboardMode ? 'py-3 sm:py-4' : 'py-2.5'}`}>
                <button type="button" onClick={() => onBook(ticket)} className="inline-flex min-h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#FF6B35] px-4 text-sm font-semibold text-white transition hover:bg-[#003366] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35]">
                  <FiShoppingCart aria-hidden="true" />{dashboardMode ? 'Book Now' : 'Book Now'}
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
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [airlines, setAirlines] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTicketId, setSelectedTicketId] = useState('')
  const [bookingTicketId, setBookingTicketId] = useState('')
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
      const params = new URLSearchParams(window.location.search)
      const ticketId = params.get('ticketId') || ''
      setSelectedTicketId(ticketId)
      if (params.get('book') === 'true') setBookingTicketId(ticketId)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [dashboardMode])

  const handleBook = (ticket) => {
    if (user) {
      setBookingTicketId(ticket._id)
      return
    }
    const destination = `/dashboard/group-bookings?book=true&ticketId=${encodeURIComponent(ticket._id)}`
    router.push(`/login?returnTo=${encodeURIComponent(destination)}`)
  }

  const closeBooking = () => {
    setBookingTicketId('')
    if (dashboardMode && window.location.search) router.replace('/dashboard/group-bookings')
  }

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
                    dashboardMode={dashboardMode}
                    selectedTicketId={selectedTicketId}
                    onBook={handleBook}
                  />
                ))}
        </section>
      </div>
      {bookingTicketId && user && tickets.some((ticket) => ticket._id === bookingTicketId) && (
        <GroupTicketBookingModal
          ticket={tickets.find((ticket) => ticket._id === bookingTicketId)}
          user={user}
          onClose={closeBooking}
          onBooked={() => router.push('/dashboard/bookings')}
        />
      )}
    </main>
  )
}
