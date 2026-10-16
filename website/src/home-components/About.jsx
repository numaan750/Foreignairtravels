import Image from 'next/image'
import Link from 'next/link'
import {
  FiArrowUpRight,
  FiCalendar,
  FiCheck,
  FiCompass,
  FiShield,
} from 'react-icons/fi'

const planningPoints = [
  {
    icon: FiCompass,
    number: '01',
    title: 'Built around your trip',
    text: 'Routes, stays and experiences shaped around your dates, budget and pace.',
  },
  {
    icon: FiShield,
    number: '02',
    title: 'Clear at every step',
    text: 'Practical guidance for bookings, visa files and travel requirements.',
  },
  {
    icon: FiCalendar,
    number: '03',
    title: 'Here beyond booking',
    text: 'A responsive team for questions, changes and travel-day coordination.',
  },
]

const About = () => {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative isolate scroll-mt-[96px] overflow-hidden bg-[#f5f3ed] py-[64px] sm:py-[84px] lg:py-[120px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-16 -z-10 size-72 rounded-full bg-[#ff6b35]/8 blur-3xl sm:size-96"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-0 -z-10 size-[420px] rounded-full bg-teal-800/8 blur-3xl"
      />

      <div className="mycontainer">
        <div className="grid min-w-0 items-center gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-16 xl:gap-24">
          <div className="min-w-0 lg:py-6">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e95f2d] sm:text-[12px]">
              <span aria-hidden="true" className="h-px w-8 bg-[#e95f2d]" />
              About Foreign Air Travel
            </p>

            <h2
              id="about-title"
              className="mt-5 max-w-[680px] text-[34px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#07324a] text-balance sm:text-[44px] lg:text-[52px] xl:text-[58px]"
            >
              Your Journey Deserves More Than A Booking.
            </h2>

            <p className="mt-6 max-w-[620px] text-[15px] leading-[26px] text-slate-600 sm:text-[17px] sm:leading-[29px]">
              We bring flights, hotels, visa support, tours and sacred journeys
              into one thoughtfully managed plan. You bring the idea; our team
              helps make every next step feel clear and considered.
            </p>

            <ul className="mt-9 grid gap-0 sm:grid-cols-3 lg:grid-cols-1">
              {planningPoints.map(({ icon: Icon, number, title, text }) => (
                <li
                  key={title}
                  className="group grid grid-cols-[44px_minmax(0,1fr)_auto] gap-x-4 border-t border-[#07324a]/12 py-5 first:pt-0 sm:block sm:border-l sm:border-t-0 sm:px-4 sm:py-0 sm:first:border-l-0 sm:first:pl-0 lg:grid lg:grid-cols-[48px_minmax(0,1fr)_auto] lg:border-l-0 lg:border-t lg:px-0 lg:py-5 lg:first:border-t-0 lg:first:pt-0"
                >
                  <span className="row-span-2 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#07324a] shadow-[0_10px_30px_rgba(7,50,74,0.08)] transition-colors duration-300 group-hover:bg-[#07324a] group-hover:text-white lg:size-12">
                    <Icon aria-hidden="true" className="size-[19px] lg:size-5" />
                  </span>

                  <div className="min-w-0 sm:mt-4 lg:mt-0">
                    <h3 className="text-[15px] font-semibold leading-[21px] text-[#07324a] sm:text-[14px] lg:text-[16px]">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-[21px] text-slate-600 sm:text-[13px] sm:leading-[20px] lg:text-[14px] lg:leading-[22px]">
                      {text}
                    </p>
                  </div>

                  <span className="pt-0.5 text-[10px] font-semibold tracking-[0.18em] text-[#e95f2d] sm:mt-3 sm:block lg:mt-0">
                    {number}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-col gap-4 min-[430px]:flex-row min-[430px]:items-center">
              <Link
                href="#services"
                className="group inline-flex h-[52px] w-full items-center justify-between rounded-full bg-[#07324a] pl-6 pr-2 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(7,50,74,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0b455d] hover:shadow-[0_18px_38px_rgba(7,50,74,0.24)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e95f2d] min-[430px]:w-auto min-[430px]:gap-8 sm:text-[15px]"
              >
                Explore our services
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#ff6b35] text-white transition-transform duration-300 group-hover:rotate-45">
                  <FiArrowUpRight aria-hidden="true" className="size-4" />
                </span>
              </Link>

              <p className="inline-flex items-center gap-2 text-[12px] font-medium text-[#07324a]/70 sm:text-[13px]">
                <FiCheck aria-hidden="true" className="size-4 text-[#e95f2d]" />
                One team. One clear travel plan.
              </p>
            </div>
          </div>

          <div className="relative min-w-0 pb-5 sm:px-5 sm:pb-8 lg:px-0 lg:pb-10">
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 hidden h-[88%] w-[88%] rounded-[36px] border border-[#07324a]/10 sm:block lg:-left-5"
            />

            <div className="relative ml-auto aspect-[4/5] w-full overflow-hidden rounded-[28px] bg-slate-300 shadow-[0_32px_80px_rgba(7,50,74,0.20)] sm:aspect-[16/11] sm:w-[94%] sm:rounded-[36px] lg:aspect-auto lg:min-h-[660px] lg:w-[94%]">
              <Image
                src="/cappadocia-journey.png"
                alt="A sunrise journey overlooking Cappadocia and its hot-air balloons"
                fill
                sizes="(min-width: 1280px) 50vw, (min-width: 1024px) 52vw, 90vw"
                className="object-cover object-center"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,29,41,0.12)_0%,rgba(4,29,41,0.02)_42%,rgba(4,29,41,0.78)_100%)]"
              />

              <div className="absolute left-4 top-4 inline-flex min-h-9 items-center gap-2 rounded-full border border-white/35 bg-[#07324a]/35 px-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm backdrop-blur-md sm:left-6 sm:top-6 sm:text-[11px]">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-[#ff8a61]" />
                Travel, thoughtfully
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-8">
                <p className="max-w-[520px] text-[24px] font-semibold leading-[1.12] tracking-[-0.035em] text-white sm:text-[30px] lg:text-[34px]">
                  From the first idea to the final itinerary.
                </p>
                <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-white/70 sm:text-[12px]">
                  Flights <span className="px-1.5 text-[#ff9c78]">/</span> Stays
                  <span className="px-1.5 text-[#ff9c78]">/</span> Visas
                  <span className="px-1.5 text-[#ff9c78]">/</span> Tours
                </p>
              </div>
            </div>

            <div className="relative z-10 -mt-5 ml-3 mr-3 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 p-3.5 shadow-[0_18px_45px_rgba(7,50,74,0.16)] backdrop-blur-md sm:absolute sm:-bottom-1 sm:left-0 sm:ml-0 sm:max-w-[320px] sm:p-4 lg:-left-8 lg:bottom-0">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#ff6b35] text-white sm:size-12">
                <FiCheck aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold leading-5 text-[#07324a] sm:text-[15px]">
                  Every detail, connected
                </p>
                <p className="mt-0.5 text-[12px] leading-[18px] text-slate-500 sm:text-[13px]">
                  One place for the moving parts of your trip.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
