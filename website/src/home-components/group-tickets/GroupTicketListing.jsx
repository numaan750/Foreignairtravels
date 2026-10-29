'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiCalendar, FiClock, FiShoppingCart } from 'react-icons/fi'
import { FaPlane, FaPlaneArrival, FaPlaneDeparture, FaSuitcase, FaUtensils } from 'react-icons/fa'
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

function TicketGroupCard({ tickets, selectedTicketId, onBook }) {
  const firstTicket = tickets[0]
  const airlineName = firstTicket.airlineId?.name || firstTicket.airline
  const airlineLogo = firstTicket.airlineId?.logo || firstTicket.airlineLogo
  const columnLayout = 'xl:grid-cols-[minmax(120px,1.05fr)_minmax(170px,1.35fr)_minmax(120px,1fr)_minmax(80px,0.7fr)_minmax(75px,0.65fr)_minmax(155px,1.1fr)_minmax(120px,0.85fr)]'

  return (
    <article className={`overflow-hidden rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,51,102,0.06)] ${tickets.some((ticket) => ticket._id === selectedTicketId) ? 'border-[#FF6B35] ring-2 ring-[#FF6B35]/15' : 'border-slate-200'}`}>
      <div className="grid min-w-0 grid-cols-1 items-center gap-2 border-b border-slate-100 px-4 py-4 sm:grid-cols-[1fr_auto_1fr] sm:gap-5 sm:px-6 sm:py-5">
        <div className="mx-auto flex w-fit max-w-full min-w-0 items-center justify-center gap-2 sm:col-start-2 sm:row-start-1 sm:gap-15">
          <div className="flex h-14 w-20 shrink-0 items-center justify-center sm:h-16 sm:w-32">
          {airlineLogo
            ? <img src={airlineLogo} alt={`${airlineName} logo`} className="max-h-full max-w-full object-contain" />
            : <span className="text-lg font-bold text-[#003366]">{airlineName?.slice(0, 2).toUpperCase()}</span>}
          </div>
          <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#003366]/5 text-[#003366] sm:size-11">
            <FaPlane className="size-5 -rotate-45 sm:size-6" />
          </span>
          <div className="min-w-0">
            <p className="whitespace-normal break-words text-sm font-semibold leading-5 text-[#003366] sm:text-lg">{airlineName}</p>
            {/* <p className="mt-1 whitespace-normal break-words text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-[#FF6B35] sm:text-xs">
              {firstTicket.category?.name}
            </p> */}
          </div>
        </div>
        <span className="mx-auto whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 sm:col-start-3 sm:row-start-1 sm:mx-0 sm:justify-self-end">
          {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
        </span>
      </div>

      <div className={`hidden min-w-0 grid-cols-7 items-center gap-0 bg-gradient-to-r from-[#124f7c] to-[#2097dc] py-3 text-center text-:sm md:text-md font-semibold uppercase tracking-[0.08em] text-white ${columnLayout} xl:grid`}>
        <span className="flex items-center justify-center gap-2"><FiCalendar aria-hidden="true" />Date</span>
        <span className="flex items-center justify-center gap-2"><FaPlane aria-hidden="true" />Flight</span>
        <span className="flex items-center justify-center gap-2"><FiClock aria-hidden="true" />Time</span>
        <span className="flex items-center justify-center gap-2"><FaSuitcase aria-hidden="true" />Bag</span>
        <span className="flex items-center justify-center gap-2"><FaUtensils aria-hidden="true" />Meal</span>
        <span>Fare</span>
        <span aria-label="Booking action" className="flex w-full items-center justify-center"><FiShoppingCart aria-hidden="true" /></span>
      </div>

      {tickets.map((ticket, ticketIndex) => {
        const selected = ticket._id === selectedTicketId
        return (
          <div key={ticket._id} className={ticketIndex > 0 ? 'border-t border-slate-200' : ''}>
            <div className={`grid min-w-0 grid-cols-2 divide-x divide-y divide-slate-100 ${columnLayout} xl:divide-y-0`}>
              <div className="min-w-0 px-4 py-3 sm:px-5 mx-auto">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 xl:hidden">Date</p>
                <p className="flex items-center gap-1.5 text-sm ms:text-md font-bold text-[#003366]">
                  <FiCalendar aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                  <span>{formatDate(ticket.departureDate)}</span>
                </p>
                {/* <p className="mt-1 break-words text-[11px] leading-4 text-slate-500">{ticket.groupName}</p> */}
                {selected && <span className="mt-1 inline-block rounded-full bg-[#FF6B35]/10 px-2 py-0.5 text-[10px] font-semibold text-[#FF6B35]">Selected ticket</span>}
              </div>
              <div className="min-w-0 px-4 py-3 sm:px-5 mx-auto">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 xl:hidden">Flight</p>
                <div className="space-y-1">
                  {ticket.segments.map((segment, index) => (
                    <div key={`${segment.flightNumber}-${index}`} className="min-w-0 text-xs leading-5 text-[#003366]">
                      {/* <p className="flex min-w-0 flex-wrap items-center gap-1 font-medium">
                        <FaPlaneDeparture aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                        <span className="break-words">{segment.from}</span>
                        <FaPlaneArrival aria-hidden="true" className="shrink-0 text-[#FF6B35]" />
                        <span className="break-words">{segment.to}</span>
                      </p> */}
                      <p className="break-words pl-4 text-sm md:text-md font-bold text-black">{segment.flightNumber}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="min-w-0 px-4 py-3 sm:px-5 mx-auto">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 xl:hidden">Time</p>
                <div className="space-y-1">
                  {ticket.segments.map((segment, index) => (
                    <p key={`${segment.flightNumber}-time-${index}`} className="flex min-w-0 items-start gap-1 text-xs leading-5 text-[#003366]">
                      <FiClock aria-hidden="true" className="shrink-0 mt-1 text-[#FF6B35]" />
                      <span className="break-words text-sm md:text-md font-bold">{segment.departureTime || 'TBA'}{segment.arrivalTime ? ` – ${segment.arrivalTime}` : ''}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="min-w-0 px-4 py-3 sm:px-5 mx-auto">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 xl:hidden">Bag</p>
                <p className="break-words text-sm md:text-md font-bold text-[#003366]">{ticket.baggage}</p>
              </div>
              <div className="min-w-0 px-4 py-3 sm:px-5 mx-auto">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 xl:hidden">Meal</p>
                <p className={`text-sm md:text-md font-bold ${ticket.mealAvailable ? 'text-emerald-600' : 'text-red-600'}`}>{ticket.mealAvailable ? 'Yes' : 'No'}</p>
              </div>
              <div className="min-w-0 px-4 py-3 sm:px-5 mx-auto">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 xl:hidden">Fare</p>
                <p className="break-words text-sm md:text-md font-bold text-emerald-700"> {fare(ticket.currency, ticket.adultFare)}</p>
                {/* <p className="break-words text-[11px] leading-5 text-slate-500">Child · {fare(ticket.currency, ticket.childFare)}</p>
                <p className="break-words text-[11px] leading-5 text-slate-500">Infant · {ticket.infantPriceOnCall ? 'Price on call' : fare(ticket.currency, ticket.infantFare)}</p> */}
              </div>
              <div className="col-span-2 flex min-w-0 items-center px-2 py-3 sm:px-3 xl:col-span-1">
                <button type="button" onClick={() => onBook(ticket)} className="inline-flex min-h-9 w-full min-w-0 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-full bg-[#FF6B35] px-2 text-xs font-semibold text-white transition hover:bg-[#003366] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35] sm:text-sm">
                  <FiShoppingCart aria-hidden="true" />Book Now
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </article>
  )
}

export default function GroupTicketListing({ slug = '', dashboardMode = false, previewMode = false }) {
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
  const filteredTickets = selectedTicketId
    ? [...dateAndTimeFilteredTickets].sort((first, second) => Number(second._id === selectedTicketId) - Number(first._id === selectedTicketId))
    : dateAndTimeFilteredTickets
  const displayedTickets = previewMode ? filteredTickets.slice(0, 3) : filteredTickets
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

        {!previewMode && <div className={`${dashboardMode ? 'mb-6' : 'mt-7 mb-6'} grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4`}>
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
        </div>}

        <section aria-label="Group ticket listings" className={`${dashboardMode ? 'mt-0' : 'mt-6'} space-y-3`}>
          {loading ? <p className="rounded-2xl bg-white p-6 text-sm text-slate-600">Loading group tickets...</p>
            : error ? <p role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">{error}</p>
              : displayedTickets.length === 0 ? <p className="rounded-2xl bg-white p-6 text-sm text-slate-600">{selectedAirlineId || departureDate || departureTime ? 'No tickets match the selected filters.' : 'No group tickets are available right now. Please check again soon.'}</p>
                : ticketGroups.map((group) => (
                  <TicketGroupCard
                    key={group.key}
                    tickets={group.tickets}
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
