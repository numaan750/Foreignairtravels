'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { FiArrowUpRight, FiClock, FiMapPin, FiUsers } from 'react-icons/fi'
import { useApp } from '@/context/AppContext'

// Backend ka data card ke format mein badalta hai
const toCard = (pkg) => ({
  id: pkg._id,
  title: pkg.title,
  location: pkg.location,
  image: pkg.image,
  description: pkg.description,
  label: pkg.isFeatured ? 'Featured package' : 'Package',
  duration: `${pkg.days} Days / ${pkg.nights} Nights`,
  tripType: pkg.travelType,
  price: `${pkg.currency} ${pkg.price.toLocaleString('en-US')}`,
})

const Packeges = () => {
  const { getPackages } = useApp()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { ok, data } = await getPackages()
      if (ok) setPackages(data.data.map(toCard))
      setLoading(false)
    }
    load()
  }, [getPackages])

  return (
    <section
      id="packages"
      aria-labelledby="packages-title"
      className="scroll-mt-[96px] bg-[#f5f3ed] py-16 sm:py-20 lg:py-28"
    >
      <div className="mycontainer">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,440px)] lg:items-end lg:gap-12">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF6B35] sm:text-[12px]">
              <span aria-hidden="true" className="h-px w-8 bg-[#FF6B35]" />
              Featured journeys
            </p>

            <h2
              id="packages-title"
              className="mt-4 max-w-[760px] text-[34px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#003366] text-balance sm:text-[46px] lg:text-[56px]"
            >
              Choose Where You Go Next.
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-[440px] text-[15px] leading-[26px] text-slate-600 sm:text-[16px] sm:leading-[28px]">
              Compare each journey by destination, duration and starting price,
              then speak with our team for the complete plan.
            </p>
            <p className="mt-3 hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[#FF6B35] lg:block">
              Hover a card to see more
            </p>
          </div>
        </div>
        {!loading && packages.length === 0 && (
          <p className="mt-10 text-[15px] text-slate-600">
            Packages are coming soon. Please check back shortly.
          </p>
        )}

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
           {packages.map((item) => (
            <li key={item.id} className="min-w-0">
              <article className="group relative isolate flex min-h-[450px] h-full overflow-hidden rounded-[26px] bg-[#003366] shadow-[0_20px_55px_rgba(0,51,102,0.14)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(0,51,102,0.22)] focus-within:-translate-y-1 sm:rounded-[30px]">
                <Image
                  src={item.image}
                  alt={`${item.title} travel view`}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  className="-z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] group-focus-within:scale-[1.06]"
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.05)_28%,rgba(0,0,0,0.92)_100%)] transition-colors duration-500 group-hover:bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.18)_25%,rgba(0,0,0,0.97)_100%)] group-focus-within:bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.18)_25%,rgba(0,0,0,0.97)_100%)]"
                />

                <div className="flex w-full flex-col justify-between p-5 sm:p-6">
                  <div>
                    <span className="inline-flex rounded-full border border-white/25 bg-[#003366]/55 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-md sm:text-[10px]">
                      {item.label}
                    </span>
                  </div>

                  <div className="text-white">
                    <p className="flex items-center gap-2 text-[11px] font-medium text-[#ffb092] sm:text-[12px]">
                      <FiMapPin aria-hidden="true" className="size-[15px] shrink-0" />
                      {item.location}
                    </p>

                    <h3 className="mt-2 text-[28px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[30px]">
                      {item.title}
                    </h3>

                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/20 pt-4">
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/55">
                          Starting from
                        </p>
                        <p className="mt-1 text-[21px] font-bold tracking-[-0.025em] text-white">
                          {item.price}
                        </p>
                      </div>
                      <p className="pb-1 text-[10px] text-white/55">per person</p>
                    </div>

                    <div className="mt-4 grid grid-rows-[1fr] opacity-100 transition-all duration-500 ease-out lg:mt-0 lg:grid-rows-[0fr] lg:translate-y-4 lg:opacity-0 lg:group-hover:mt-4 lg:group-hover:grid-rows-[1fr] lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:mt-4 lg:group-focus-within:grid-rows-[1fr] lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100">
                      <div className="overflow-hidden">
                        <p className="text-[13px] leading-[22px] text-white/70">
                          {item.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-[10px] font-medium text-white backdrop-blur-sm sm:gap-2 sm:px-3 sm:py-2">
                            <FiClock aria-hidden="true" className="size-[13px] text-[#ff9c78]" />
                            {item.duration}
                          </span>
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-[10px] font-medium text-white backdrop-blur-sm sm:gap-2 sm:px-3 sm:py-2">
                            <FiUsers aria-hidden="true" className="size-[13px] text-[#ff9c78]" />
                            {item.tripType}
                          </span>
                        </div>

                        <a
                          href="https://wa.me/966596382847"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Ask about ${item.title} on WhatsApp`}
                          className="mt-4 inline-flex h-[44px] items-center gap-2 rounded-full bg-[#FF6B35] px-5 text-[12px] sm:mt-5 font-semibold text-white transition-all duration-300 hover:bg-white hover:text-[#003366] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        >
                          View details
                          <FiArrowUpRight aria-hidden="true" className="size-[16px]" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Packeges
