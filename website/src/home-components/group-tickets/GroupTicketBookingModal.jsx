'use client'

import { useMemo, useState } from 'react'
import { FiX } from 'react-icons/fi'
import { useApp } from '@/context/AppContext'

const passengerTypes = [
  { key: 'adults', type: 'adult', label: 'Adult', fare: 'adultFare' },
  { key: 'children', type: 'child', label: 'Child', fare: 'childFare' },
  { key: 'infants', type: 'infant', label: 'Infant', fare: 'infantFare' },
]

const emptyPassenger = (type) => ({
  type,
  title: type === 'adult' ? 'Mr' : type === 'child' ? 'Master' : 'Master',
  firstName: '',
  lastName: '',
  gender: 'Male',
  passportNumber: '',
  dateOfBirth: '',
  passportExpiry: '',
  nationality: '',
  passportIssueDate: '',
})

const inputClass =
  'h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#153750] outline-none transition placeholder:text-slate-400 focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/10'

function Field({ label, children, className = '' }) {
  return (
    <label className={`block min-w-0 text-xs font-semibold text-[#1f3c54] ${className}`}>
      {label}
      <span className="mt-1.5 block">{children}</span>
    </label>
  )
}

const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date)
}

const formatFare = (currency, amount) =>
  `${currency} ${Number(amount || 0).toLocaleString('en-US')}`

export default function GroupTicketBookingModal({ ticket, user, onClose, onBooked }) {
  const { createGroupBooking } = useApp()
  const [counts, setCounts] = useState({ adults: 1, children: 0, infants: 0 })
  const [passengers, setPassengers] = useState([emptyPassenger('adult')])
  const [contactPhone, setContactPhone] = useState(user?.number || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const passengerTotal = counts.adults + counts.children + counts.infants
  const totalPrice = useMemo(() => (
    (counts.adults * Number(ticket.adultFare || 0))
    + (counts.children * Number(ticket.childFare || 0))
    + (ticket.infantPriceOnCall ? 0 : counts.infants * Number(ticket.infantFare || 0))
  ), [counts, ticket])

  const resizeCount = (key, value) => {
    const nextCounts = { ...counts, [key]: value }
    const nextPassengers = passengerTypes.flatMap(({ key: countKey, type }) => (
      Array.from({ length: nextCounts[countKey] }, (_, index) => {
        const existing = passengers.filter((passenger) => passenger.type === type)[index]
        return existing || emptyPassenger(type)
      })
    ))
    setCounts(nextCounts)
    setPassengers(nextPassengers)
  }

  const updatePassenger = (index, field, value) => {
    setPassengers((current) => current.map((passenger, position) => (
      position === index ? { ...passenger, [field]: value } : passenger
    )))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (saving) return
    setError('')
    setSaving(true)

    const result = await createGroupBooking({
      ticketId: ticket._id,
      passengerCounts: counts,
      passengers,
      contactPhone: contactPhone.trim(),
    })
    if (result.ok) {
      setSuccessMessage(result.data.message || 'Booking submitted successfully.')
    } else {
      setError(result.data.message || 'Could not submit this booking.')
    }
    setSaving(false)
  }

  const segments = ticket.segments || []
  const airline = ticket.airlineId?.name || ticket.airline
  const logo = ticket.airlineId?.logo || ticket.airlineLogo
  const categoryName = ticket.category?.name || 'Group ticket'

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto overscroll-contain bg-slate-950/60 p-2 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-booking-title"
        className="my-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2.5rem)]"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6">
          <h2 id="group-booking-title" className="text-lg font-bold text-[#003366] sm:text-xl">Book Flight</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close booking form"
            className="grid size-9 place-items-center rounded-lg text-xl text-slate-500 transition hover:bg-slate-100 hover:text-[#003366] disabled:opacity-50"
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        {successMessage ? (
          <div className="overflow-y-auto p-6 sm:p-8">
            <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
              {successMessage}
            </p>
            {ticket.infantPriceOnCall && counts.infants > 0 && (
              <p className="mt-3 text-sm text-slate-600">The infant fare will be confirmed by our team.</p>
            )}
            <button
              type="button"
              onClick={onBooked}
              className="mt-5 h-11 rounded-xl bg-[#FF6B35] px-5 text-sm font-semibold text-white hover:bg-[#e95724]"
            >
              Go to My Bookings
            </button>
          </div>
        ) : (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
              <section className="rounded-2xl border border-violet-100 bg-[#f8f7ff] p-3 sm:p-5">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex min-w-0 items-center gap-2 rounded-xl bg-white p-3">
                    {logo && <img src={logo} alt="" className="size-8 shrink-0 rounded-md object-contain" />}
                    <div className="min-w-0"><p className="text-[10px] font-semibold uppercase text-slate-400">Airline</p><p className="truncate text-sm font-semibold text-[#153750]">{airline}</p></div>
                  </div>
                  <div className="rounded-xl bg-white p-3"><p className="text-[10px] font-semibold uppercase text-slate-400">Flight no.</p><p className="truncate text-sm font-semibold text-[#153750]">{segments.map((segment) => segment.flightNumber).join(', ')}</p></div>
                  <div className="rounded-xl bg-white p-3"><p className="text-[10px] font-semibold uppercase text-slate-400">Departure</p><p className="text-sm font-semibold text-[#153750]">{formatDate(ticket.departureDate)}</p></div>
                  <div className="rounded-xl bg-white p-3"><p className="text-[10px] font-semibold uppercase text-slate-400">Time</p><p className="truncate text-sm font-semibold text-[#153750]">{segments.map((segment) => segment.departureTime || 'TBA').join(', ')}</p></div>
                  <div className="rounded-xl bg-white p-3"><p className="text-[10px] font-semibold uppercase text-slate-400">Baggage</p><p className="text-sm font-semibold text-[#153750]">{ticket.baggage}</p></div>
                  <div className="rounded-xl bg-white p-3"><p className="text-[10px] font-semibold uppercase text-slate-400">Adult fare</p><p className="text-sm font-semibold text-[#153750]">{formatFare(ticket.currency, ticket.adultFare)}</p></div>
                  <div className="rounded-xl bg-white p-3"><p className="text-[10px] font-semibold uppercase text-slate-400">Child fare</p><p className="text-sm font-semibold text-[#153750]">{formatFare(ticket.currency, ticket.childFare)}</p></div>
                  <div className="rounded-xl bg-white p-3"><p className="text-[10px] font-semibold uppercase text-slate-400">Infant fare</p><p className="text-sm font-semibold text-[#153750]">{ticket.infantPriceOnCall ? 'Price on call' : formatFare(ticket.currency, ticket.infantFare)}</p></div>
                  <div className="rounded-xl bg-white p-3"><p className="text-[10px] font-semibold uppercase text-slate-400">Group type</p><p className="truncate text-sm font-semibold text-[#153750]">{categoryName}</p></div>
                  <div className="rounded-xl bg-white p-3"><p className="text-[10px] font-semibold uppercase text-slate-400">Group name</p><p className="truncate text-sm font-semibold text-[#153750]">{ticket.groupName}</p></div>
                  <div className="rounded-xl bg-white p-3"><p className="text-[10px] font-semibold uppercase text-slate-400">Meal</p><p className="text-sm font-semibold text-[#153750]">{ticket.mealAvailable ? 'Yes' : 'No'}</p></div>
                </div>
              </section>

              <section>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <h3 className="text-lg font-semibold text-[#153750]">Passengers</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {passengerTypes.map(({ key, label, fare }) => (
                      <div key={key} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2">
                        <span className="text-xs font-medium text-slate-600">{label}</span>
                        <button type="button" aria-label={`Remove one ${label.toLowerCase()}`} disabled={key === 'adults' ? counts[key] <= 1 : counts[key] <= 0} onClick={() => resizeCount(key, counts[key] - 1)} className="size-7 rounded-md bg-slate-100 font-bold text-[#003366] disabled:opacity-40">−</button>
                        <span className="min-w-4 text-center text-sm font-semibold text-[#153750]">{counts[key]}</span>
                        <button type="button" aria-label={`Add one ${label.toLowerCase()}`} disabled={passengerTotal >= 9} onClick={() => resizeCount(key, counts[key] + 1)} className="size-7 rounded-md bg-violet-50 font-bold text-violet-700 disabled:opacity-40">+</button>
                        <span className="hidden text-[10px] text-slate-500 2xl:inline">{ticket.infantPriceOnCall && key === 'infants' ? 'On call' : formatFare(ticket.currency, ticket[fare])}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-xs font-semibold text-[#153750]">Total <span>{passengerTotal}</span></div>
                  </div>
                </div>

                {passengers.map((passenger, index) => {
                  const typeLabel = passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1)
                  const number = passengers.slice(0, index + 1).filter((item) => item.type === passenger.type).length
                  return (
                    <fieldset key={`${passenger.type}-${number}`} className="mt-4 rounded-xl border border-slate-200 p-3 sm:p-4">
                      <legend className="px-2 text-sm font-semibold text-[#153750]">{typeLabel} {number}</legend>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <Field label="Title">
                          <select className={`dropdown-select ${inputClass}`} value={passenger.title} onChange={(event) => updatePassenger(index, 'title', event.target.value)} required>
                            {(passenger.type === 'adult' ? ['Mr', 'Mrs', 'Ms'] : ['Master', 'Miss']).map((title) => <option key={title}>{title}</option>)}
                          </select>
                        </Field>
                        <Field label="Given name"><input className={inputClass} value={passenger.firstName} onChange={(event) => updatePassenger(index, 'firstName', event.target.value)} autoComplete="given-name" required /></Field>
                        <Field label="Surname"><input className={inputClass} value={passenger.lastName} onChange={(event) => updatePassenger(index, 'lastName', event.target.value)} autoComplete="family-name" required /></Field>
                        <Field label="Gender">
                          <select className={`dropdown-select ${inputClass}`} value={passenger.gender} onChange={(event) => updatePassenger(index, 'gender', event.target.value)} required>
                            {['Male', 'Female', 'Other'].map((gender) => <option key={gender}>{gender}</option>)}
                          </select>
                        </Field>
                        <Field label="Passport number"><input className={inputClass} value={passenger.passportNumber} onChange={(event) => updatePassenger(index, 'passportNumber', event.target.value)} autoComplete="off" required /></Field>
                        <Field label="Date of birth"><input type="date" className={inputClass} value={passenger.dateOfBirth} onChange={(event) => updatePassenger(index, 'dateOfBirth', event.target.value)} required /></Field>
                        <Field label="Passport expiry"><input type="date" className={inputClass} value={passenger.passportExpiry} onChange={(event) => updatePassenger(index, 'passportExpiry', event.target.value)} required /></Field>
                        <Field label="Nationality"><input className={inputClass} value={passenger.nationality} onChange={(event) => updatePassenger(index, 'nationality', event.target.value)} autoComplete="country-name" required /></Field>
                        <Field label="Date of issue"><input type="date" className={inputClass} value={passenger.passportIssueDate} onChange={(event) => updatePassenger(index, 'passportIssueDate', event.target.value)} required /></Field>
                      </div>
                    </fieldset>
                  )
                })}
              </section>
            </div>

            <footer className="grid shrink-0 gap-3 border-t border-slate-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_minmax(200px,0.8fr)_auto] sm:items-end sm:px-6">
              <div className="rounded-xl border border-violet-100 bg-violet-50 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Total price</p>
                <p className="font-bold text-violet-700">{formatFare(ticket.currency, totalPrice)}</p>
                {ticket.infantPriceOnCall && counts.infants > 0 && <p className="text-[10px] text-slate-600">Infant fare will be confirmed by our team.</p>}
              </div>
              <Field label="Customer contact number">
                <input className={inputClass} type="tel" autoComplete="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} required />
              </Field>
              <div className="flex justify-end gap-2 sm:pb-0">
                <button type="button" onClick={onClose} disabled={saving} className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving || passengerTotal > 9} className="h-11 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Submitting...' : 'Submit booking'}</button>
              </div>
              {error && <p className="text-sm text-red-600 sm:col-span-3" role="alert">{error}</p>}
            </footer>
          </form>
        )}
      </section>
    </div>
  )
}
