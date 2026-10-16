import Link from 'next/link'
import {
  FiArrowRight,
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiMessageCircle,
  FiSearch,
} from 'react-icons/fi'

const steps = [
  {
    icon: FiMessageCircle,
    step: '01',
    title: 'Share your plan',
    text: 'Tell us your destination, dates, traveller count and the experience you have in mind.',
  },
  {
    icon: FiSearch,
    step: '02',
    title: 'Review your options',
    text: 'We organise suitable flight, stay and itinerary choices so they are easy to compare.',
  },
  {
    icon: FiCalendar,
    step: '03',
    title: 'Confirm the details',
    text: 'Choose the plan that fits, verify the documents and approve the final arrangements.',
  },
  {
    icon: FiCheckCircle,
    step: '04',
    title: 'Travel with support',
    text: 'Receive your confirmations and reach out if you need help before or during the journey.',
  },
]

const BookingProcess = () => {
  return (
    <section
      aria-labelledby="process-title"
      className="relative isolate overflow-hidden bg-[#f5f3ed] py-[64px] sm:py-[84px] lg:py-[120px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 -z-10 size-[420px] rounded-full border-[70px] border-[#003366]/[0.035]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 bottom-8 -z-10 size-72 rounded-full bg-[#ff6b35]/[0.07] blur-3xl"
      />

      <div className="mycontainer">
        <div className="grid items-end gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-16">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e95f2d] sm:text-[12px]">
              <span aria-hidden="true" className="h-px w-8 bg-[#e95f2d]" />
              A simple way to plan
            </p>
            <h2
              id="process-title"
              className="mt-5 max-w-[760px] text-[34px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#003366] text-balance sm:text-[44px] lg:text-[54px]"
            >
              From first conversation to ready for take-off.
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-[580px] text-[15px] leading-[26px] text-slate-600 sm:text-[16px] sm:leading-[28px] lg:ml-auto">
              You stay in control of every decision while our team handles the
              research, coordination and practical details.
            </p>
            <Link
              href="/contact"
              className="group mt-6 inline-flex h-[52px] w-full items-center justify-between rounded-full bg-[#003366] pl-6 pr-2 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(0,51,102,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0b455d] hover:shadow-[0_18px_36px_rgba(0,51,102,0.24)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff6b35] min-[430px]:w-auto min-[430px]:gap-8 sm:text-[15px]"
            >
              Start planning
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#ff6b35] text-white transition-transform duration-300 group-hover:rotate-45">
                <FiArrowUpRight aria-hidden="true" className="size-4" />
              </span>
            </Link>
          </div>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-16 lg:grid-cols-4 lg:gap-7">
          {steps.map(({ icon: Icon, step, title, text }, index) => (
            <li
              key={step}
              className="group relative flex min-h-[270px] flex-col overflow-visible rounded-[26px] border border-[#003366]/10 bg-white p-5 shadow-[0_18px_50px_rgba(0,51,102,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ff6b35]/40 hover:shadow-[0_24px_60px_rgba(0,51,102,0.12)] sm:min-h-[290px] sm:p-6 lg:min-h-[320px]"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#003366] text-white shadow-[0_10px_24px_rgba(0,51,102,0.18)] transition-colors duration-300 group-hover:bg-[#ff6b35] sm:size-14">
                  <Icon aria-hidden="true" className="size-5 sm:size-[22px]" />
                </span>
                <span className="text-[34px] font-semibold leading-none tracking-[-0.06em] text-[#003366]/[0.10] transition-colors duration-300 group-hover:text-[#ff6b35]/20 sm:text-[42px]">
                  {step}
                </span>
              </div>

              <div className="mt-auto pt-10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e95f2d] sm:text-[11px]">
                  Step {step}
                </p>
                <h3 className="mt-2.5 text-[20px] font-semibold leading-[1.2] tracking-[-0.025em] text-[#003366] sm:text-[22px]">
                  {title}
                </h3>
                <p className="mt-3 text-[14px] leading-[23px] text-slate-600 sm:text-[15px] sm:leading-[24px]">
                  {text}
                </p>
              </div>

              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-5 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#f5f3ed] bg-[#ff6b35] text-white shadow-md lg:flex"
                >
                  <FiArrowRight className="size-4" />
                </span>
              )}
            </li>
          ))}
        </ol>

        <div className="mt-7 flex items-center gap-3 border-t border-[#003366]/10 pt-6 sm:mt-9">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#ff6b35]/10 text-[#e95f2d]">
            <FiCheckCircle aria-hidden="true" className="size-4" />
          </span>
          <p className="text-[12px] leading-5 text-[#003366]/65 sm:text-[13px]">
            Clear choices, confirmed details and support throughout your journey.
          </p>
        </div>
      </div>
    </section>
  )
}

export default BookingProcess
